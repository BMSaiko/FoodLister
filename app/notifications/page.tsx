'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, Trash2, CalendarPlus, Clock, Star, MessageCircle, ListPlus, ListChecks, MapPinCheck, Loader2, ArrowLeft, Inbox } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/ui/navigation/Navbar';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import useNotifications from '@/hooks/data/useNotifications';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import type { Notification } from '@/types/notification';
import type { NotificationType } from '@/types/notification';
import { NOTIFICATION_TYPE_CONFIG } from '@/types/notification';

const ITEM_VARIANTS = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

function getNotificationIcon(type: string, size: 'sm' | 'md' = 'md') {
  const cls = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  switch (type) {
    case 'meal_invitation': return <CalendarPlus className={`${cls} text-amber-400`} />;
    case 'meal_reminder': return <Clock className={`${cls} text-orange-400`} />;
    case 'review_created': return <Star className={`${cls} text-yellow-400`} />;
    case 'comment_reply': return <MessageCircle className={`${cls} text-blue-400`} />;
    case 'list_invite': return <ListPlus className={`${cls} text-emerald-400`} />;
    case 'list_update': return <ListChecks className={`${cls} text-teal-400`} />;
    case 'restaurant_visit': return <MapPinCheck className={`${cls} text-purple-400`} />;
    default: return <Bell className={`${cls} text-white/30`} />;
  }
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora mesmo';
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
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
    else label = d.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  }
  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

type FilterType = 'all' | 'unread' | NotificationType;

const FILTER_TABS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'unread', label: 'Não lidas' },
  { key: 'meal_invitation', label: 'Refeições' },
  { key: 'review_created', label: 'Reviews' },
  { key: 'list_invite', label: 'Listas' },
  { key: 'system', label: 'Sistema' },
];

function NotificationItem({ notification, onDelete, onRead }: {
  notification: Notification;
  onDelete: (id: string) => void;
  onRead: (id: string) => void;
}) {
  const router = useRouter();
  const typeConfig = NOTIFICATION_TYPE_CONFIG[notification.type as keyof typeof NOTIFICATION_TYPE_CONFIG];
  const accentColor = typeConfig?.color || 'rgba(255,255,255,0.5)';

  const handleClick = () => {
    if (!notification.read) onRead(notification.id);
    if (notification.link) router.push(notification.link);
  };

  return (
    <motion.div
      variants={ITEM_VARIANTS}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
      className={`group relative rounded-2xl border transition-colors duration-150 ${
        notification.read
          ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.08]'
          : 'bg-[rgba(245,158,11,0.03)] border-[rgba(245,158,11,0.12)] hover:bg-[rgba(245,158,11,0.05)]'
      }`}
    >
      {/* Unread accent line */}
      {!notification.read && (
        <div
          className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full"
          style={{ background: accentColor }}
        />
      )}

      <div
        className="flex items-start gap-4 p-5 pl-6 cursor-pointer"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
      >
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            notification.read ? 'bg-white/[0.03]' : 'bg-white/[0.06]'
          }`}>
            {getNotificationIcon(notification.type, 'md')}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className={`text-sm leading-snug ${
                notification.read ? 'text-white/50 font-normal' : 'text-white/90 font-semibold'
              }`}>
                {notification.title}
              </p>
              <p className="text-sm text-white/30 mt-1 line-clamp-2 leading-relaxed">
                {notification.message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.read && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRead(notification.id); }}
                  className="p-2 rounded-lg text-white/20 hover:text-[var(--primary)] hover:bg-white/[0.04] transition-colors"
                  aria-label="Marcar como lida"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
                className="p-2 rounded-lg text-white/20 hover:text-[var(--error)] hover:bg-white/[0.04] transition-colors"
                aria-label="Apagar notificação"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-2.5">
            <span className="text-[11px] text-white/20">
              {formatTimeAgo(notification.created_at)}
            </span>
            {typeConfig && (
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ color: accentColor, background: `${accentColor}15` }}
              >
                {typeConfig.label}
              </span>
            )}
            {!notification.read && (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonItem() {
  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 pl-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex-shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="h-4 bg-white/[0.04] rounded w-2/3" />
          <div className="h-3 bg-white/[0.03] rounded w-full" />
          <div className="flex items-center gap-3 mt-3">
            <div className="h-3 bg-white/[0.03] rounded w-16" />
            <div className="h-3 bg-white/[0.03] rounded w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [displayNotifications, setDisplayNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    let filtered = notifications;
    if (activeFilter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (activeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === activeFilter);
    }
    setDisplayNotifications(filtered);
  }, [notifications, activeFilter]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteNotification(id);
  }, [deleteNotification]);

  const handleRead = useCallback(async (id: string) => {
    await markAsRead(id);
  }, [markAsRead]);

  const grouped = groupByDate(displayNotifications);

  return (
    <ErrorBoundary pageName="Notifications">
      <div className="min-min-h-[100dvh] bg-[var(--background)] mesh-gradient-bg">
        <Navbar />
        <Container variant="narrow" className="py-6 sm:py-10">

          {/* Header */}
          <PageHeader
            title="Notificações"
            subtitle={unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}` : 'Todas lidas'}
            backLink="/restaurants"
            action={
              unreadCount > 0 ? (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)] text-black text-sm font-semibold hover:bg-[var(--primary-hover)] transition-colors min-h-[40px]"
                >
                  <Check className="h-4 w-4" />
                  <span className="hidden sm:inline">Marcar todas</span>
                </button>
              ) : undefined
            }
          />

          {/* Filter Tabs */}
          <div className="mt-6 mb-8">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {FILTER_TABS.map((tab) => {
                const isActive = activeFilter === tab.key;
                const count = tab.key === 'all'
                  ? notifications.length
                  : tab.key === 'unread'
                    ? unreadCount
                    : notifications.filter(n => n.type === tab.key).length;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-150 min-h-[40px] ${
                      isActive
                        ? 'bg-[var(--primary)] text-black'
                        : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60'
                    }`}
                  >
                    {tab.label}
                    {count > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-black/10 text-black' : 'bg-white/[0.06] text-white/30'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {loading && displayNotifications.length === 0 ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => <SkeletonItem key={i} />)}
              </div>
            ) : displayNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
                  <Inbox className="h-8 w-8 text-white/15" />
                </div>
                <h3 className="text-lg font-semibold text-white/40 mb-2">
                  {activeFilter === 'unread' ? 'Sem notificações não lidas' : 'Sem notificações'}
                </h3>
                <p className="text-sm text-white/20 max-w-xs">
                  {activeFilter === 'unread'
                    ? 'Estás a dia com tudo. Boa!'
                    : 'Quando receberes notificações, elas aparecem aqui.'}
                </p>
                <Link
                  href="/restaurants"
                  className="mt-6 inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Explorar restaurantes
                </Link>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFilter}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {grouped.map((group) => (
                    <div key={group.label}>
                      {/* Group header */}
                      <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-xs font-semibold text-white/20 uppercase tracking-wider">
                          {group.label}
                        </h2>
                        <div className="flex-1 h-px bg-white/[0.04]" />
                        <span className="text-[10px] text-white/15 font-medium">
                          {group.items.length}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-3">
                        {group.items.map((notification) => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onDelete={handleDelete}
                            onRead={handleRead}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </Container>
      </div>
    </ErrorBoundary>
  );
}
