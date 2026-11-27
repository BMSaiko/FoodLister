'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuthUser } from '@/hooks/auth/useAuthUser';
import type { Notification, NotificationType } from '@/types/notification';

interface UseNotificationsOptions {
  unreadOnly?: boolean;
  types?: NotificationType[];
  limit?: number;
  polling?: boolean;
  pollingInterval?: number;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: (append?: boolean) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

const MAX_POLLING_INTERVAL = 300000;

// Pedidos GET iguais em curso partilham a mesma promessa (Navbar + dropdown montam o hook juntos).
const inFlight = new Map<string, Promise<any>>();

function fetchDeduped(url: string): Promise<any> {
  const existing = inFlight.get(url);
  if (existing) return existing;
  const p = fetch(url, { credentials: 'include' })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      return response.json();
    })
    .finally(() => {
      inFlight.delete(url);
    });
  inFlight.set(url, p);
  return p;
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const {
    unreadOnly = false,
    types,
    limit = 50,
    polling = true,
    pollingInterval = 30000,
  } = options;

  const { user } = useAuthUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const offsetRef = useRef(0);
  const fetchNotificationsRef = useRef<(append?: boolean) => Promise<void>>(async () => {});
  const signatureRef = useRef('');

  const buildUrl = useCallback((currentLimit: number, currentOffset: number) => {
    const params = new URLSearchParams();
    params.set('limit', String(currentLimit));
    params.set('offset', String(currentOffset));
    if (unreadOnly) params.set('unreadOnly', 'true');
    if (types && types.length > 0) types.forEach(t => params.append('type', t));
    return `/api/notifications?${params.toString()}`;
  }, [unreadOnly, types]);

  const fetchNotifications = useCallback(async (append = false) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const currentOffset = append ? offsetRef.current : 0;

    try {
      const result = await fetchDeduped(buildUrl(limit, currentOffset));
      const newNotifications: Notification[] = result.data || [];

      if (append) {
        setNotifications(prev => [...prev, ...newNotifications]);
      } else {
        setNotifications(newNotifications);
      }

      setUnreadCount(result.unreadCount || 0);
      signatureRef.current = `${result.unreadCount || 0}:${newNotifications[0]?.id ?? ''}:${newNotifications.length}`;
      setHasMore(newNotifications.length >= limit);
      offsetRef.current = currentOffset + newNotifications.length;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar notificações';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [user, buildUrl, limit]);

  fetchNotificationsRef.current = fetchNotifications;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    await fetchNotifications(true);
  }, [loading, hasMore, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notificationId, read: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Failed to mark all as read');
      }

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notificationId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      setNotifications(prev => {
        const removed = prev.find(n => n.id === notificationId);
        if (removed && !removed.read) {
          setUnreadCount(p => Math.max(0, p - 1));
        }
        return prev.filter(n => n.id !== notificationId);
      });
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Polling com visibilidade e back-off: só com a aba visível; o intervalo duplica
  // (até ao máximo) enquanto nada muda e volta ao base quando há novidades.
  useEffect(() => {
    if (!user || !polling) return;

    let delay = pollingInterval;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let signature = '';
    let stopped = false;

    const clear = () => {
      if (timer) clearTimeout(timer);
      timer = null;
    };

    const schedule = () => {
      clear();
      if (stopped || document.hidden) return;
      timer = setTimeout(tick, delay);
    };

    const tick = async () => {
      timer = null;
      signature = signatureRef.current;
      await fetchNotificationsRef.current(false);
      const next = signatureRef.current;
      delay = next === signature ? Math.min(delay * 2, MAX_POLLING_INTERVAL) : pollingInterval;
      schedule();
    };

    const handleVisibility = () => {
      if (document.hidden) {
        clear();
      } else {
        delay = pollingInterval;
        void tick();
      }
    };

    schedule();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stopped = true;
      clear();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user, polling, pollingInterval]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    hasMore,
    loadMore,
  };
}

export default useNotifications;
