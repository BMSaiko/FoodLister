'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, X, Check, Trash2, CalendarPlus, Clock, Star, MessageCircle, ListPlus, ListChecks, Loader2 } from 'lucide-react';
import useNotifications from '@/hooks/data/useNotifications';
import type { Notification } from '@/types/notification';
import { NOTIFICATION_TYPE_CONFIG } from '@/types/notification';

function getNotificationIcon(type: string) {
  const iconClass = 'h-4 w-4';
  switch (type) {
    case 'meal_invitation': return <CalendarPlus className={`${iconClass} text-amber-400`} />;
    case 'meal_reminder': return <Clock className={`${iconClass} text-orange-400`} />;
    case 'review_created': return <Star className={`${iconClass} text-yellow-400`} />;
    case 'comment_reply': return <MessageCircle className={`${iconClass} text-blue-400`} />;
    case 'list_invite': return <ListPlus className={`${iconClass} text-emerald-400`} />;
    case 'list_update': return <ListChecks className={`${iconClass} text-teal-400`} />;
        default: return <Bell className={`${iconClass} text-white/40`} />;
  }
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
}

function groupByDate(notifications: Notification[]): { label: string; items: Notification[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);

  const groups: Record<string, Notification[]> = {};

  for (const n of notifications) {
    const d = new Date(n.created_at);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    let label: string;

    if (dayStart.getTime() === today.getTime()) label = 'Hoje';
    else if (dayStart.getTime() === yesterday.getTime()) label = 'Ontem';
    else label = d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });

    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  }

  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

interface NotificationsDropdownProps {
  mobile?: boolean;
}

export default function NotificationsDropdown({ mobile = false }: NotificationsDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead, deleteNotification, hasMore, loadMore } = useNotifications({ polling: false });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      bellButtonRef.current?.focus();
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const items = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
      if (!items || items.length === 0) return;
      const currentIndex = Array.from(items).indexOf(document.activeElement as HTMLElement);
      let nextIndex: number;
      if (e.key === 'ArrowDown') {
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      } else {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      }
      items[nextIndex]?.focus();
    }
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      setIsOpen(false);
      router.push(notification.link);
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const toggleDropdown = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) fetchNotifications();
  };

  // Infinite scroll: load more when reaching bottom of list
  const listEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen || !hasMore || loading) return;
    const el = listEndRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { root: null, threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isOpen, hasMore, loading]);

  const grouped = groupByDate(notifications);

  // Mobile: simple bell icon that links to notifications page
  if (mobile) {
    return (
      <Link
        href="/notifications"
        className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
        aria-label={`Notificações${unreadCount > 0 ? `, ${unreadCount} não lidas` : ''}`}
      >
        <Bell className="h-4 w-4 text-[var(--foreground-secondary)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[var(--primary)] text-black text-[10px] font-bold px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef} onKeyDown={handleKeyDown}>
      {/* Bell Trigger */}
      <button
        ref={bellButtonRef}
        onClick={toggleDropdown}
        className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
        aria-label={`Notificações${unreadCount > 0 ? `, ${unreadCount} não lidas` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Bell className="h-4 w-4 text-[var(--foreground-secondary)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[var(--primary)] text-black text-[10px] font-bold px-1 animate-[scale-in_0.2s_ease-out]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Notificações"
          className="absolute right-0 top-full mt-2 w-[340px] sm:w-[380px] rounded-2xl bg-[#0a0a0a] border border-white/[0.08] shadow-2xl overflow-hidden z-50 animate-[dropdown-in_0.2s_ease-out]"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">Notificações</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1.5 text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
                  role="menuitem"
                >
                  <Check className="h-3 w-3" />
                  Marcar todas
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto" role="presentation" aria-live="polite">
              {loading && notifications.length === 0 ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-5 w-5 text-[var(--primary)] animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center mb-3">
                    <Bell className="h-5 w-5 text-white/20" />
                  </div>
                  <p className="text-sm text-white/30">Sem notificações</p>
                </div>
              ) : (
                grouped.map((group) => (
                  <div key={group.label}>
                    {/* Date group header */}
                    <div className="px-4 py-2 text-[10px] font-semibold text-white/20 uppercase tracking-wider bg-white/[0.01]">
                      {group.label}
                    </div>

                    {group.items.map((notification) => {
                      const typeConfig = NOTIFICATION_TYPE_CONFIG[notification.type as keyof typeof NOTIFICATION_TYPE_CONFIG];
                      const accentColor = typeConfig?.color || 'rgba(255,255,255,0.5)';

                      return (
                        <div
                          key={notification.id}
                          role="menuitem"
                          tabIndex={0}
                          onClick={() => handleNotificationClick(notification)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleNotificationClick(notification);
                            }
                          }}
                          className={`group/item relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors duration-150 hover:bg-white/[0.04] focus:outline-none focus:bg-white/[0.04] ${
                            !notification.read ? 'bg-[rgba(245,158,11,0.03)]' : ''
                          }`}
                        >
                          {/* Unread indicator */}
                          {!notification.read && (
                            <div
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                              style={{ background: accentColor }}
                            />
                          )}

                          {/* Icon */}
                          <div className="flex-shrink-0 mt-0.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              notification.read ? 'bg-white/[0.03]' : 'bg-white/[0.06]'
                            }`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-snug line-clamp-1 ${
                              notification.read ? 'text-white/50 font-normal' : 'text-white/90 font-medium'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-white/30 mt-0.5 line-clamp-2 leading-relaxed">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-white/20 mt-1">
                              {formatTimeAgo(notification.created_at)}
                            </p>
                          </div>

                          {/* Delete */}
                          <button
                            onClick={(e) => handleDelete(e, notification.id)}
                            className="flex-shrink-0 p-1.5 rounded-lg text-white/15 hover:text-[var(--error)] hover:bg-white/[0.04] transition-all opacity-0 group-hover/item:opacity-100"
                            aria-label="Apagar notificação"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Infinite scroll sentinel */}
            {hasMore && <div ref={listEndRef} className="h-4" aria-hidden="true" />}

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-white/[0.06] bg-white/[0.01]">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium transition-colors"
              >
                Ver todas as notificações
              </Link>
            </div>
        </div>
      )}
    </div>
  );
}
