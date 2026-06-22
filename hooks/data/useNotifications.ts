'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
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

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const {
    unreadOnly = false,
    types,
    limit = 50,
    polling = true,
    pollingInterval = 30000,
  } = options;

  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const offsetRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      const response = await fetch(buildUrl(limit, currentOffset), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const result = await response.json();
      const newNotifications: Notification[] = result.data || [];

      if (append) {
        setNotifications(prev => [...prev, ...newNotifications]);
      } else {
        setNotifications(newNotifications);
      }

      setUnreadCount(result.unreadCount || 0);
      setHasMore(newNotifications.length >= limit);
      offsetRef.current = currentOffset + newNotifications.length;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar notificações';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [user, buildUrl, limit]);

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

  // Smart polling with visibility check
  useEffect(() => {
    if (!user || !polling) return;

    const handleVisibility = () => {
      if (document.hidden) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        if (!intervalRef.current) {
          intervalRef.current = setInterval(() => {
            fetchNotifications(false);
          }, pollingInterval);
        }
      }
    };

    intervalRef.current = setInterval(() => {
      fetchNotifications(false);
    }, pollingInterval);

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user, polling, pollingInterval]); // eslint-disable-line react-hooks/exhaustive-deps

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
