'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { m as motion, AnimatePresence } from 'motion/react';
import { FILTER_GROUPS, matchesFilter, countFor, type FilterKey } from '@/libs/notifications/filters';
import Link from 'next/link';
import EmptyState from '@/components/ui/EmptyState';
import Navbar from '@/components/ui/navigation/Navbar';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import useNotifications from '@/hooks/data/useNotifications';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import type { Notification } from '@/types/notification';
import { NOTIFICATION_TYPE_CONFIG } from '@/types/notification';
import { usePageTitle } from "@/hooks/usePageTitle";
import AppIcon from '@/components/ui/icons/Icon';

const ITEM_VARIANTS = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

function getNotificationIcon(type: string, size: 'sm' | 'md' = 'md') {
  const cls = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  switch (type) {
    case 'meal_invitation': return <AppIcon name="calendario-mais" className={`${cls} text-amber-400`} />;
    case 'meal_reminder': return <AppIcon name="horario" className={`${cls} text-orange-400`} />;
    case 'review_created': return <AppIcon name="estrela" className={`${cls} text-yellow-400`} />;
    case 'comment_reply': return <AppIcon name="mensagem" className={`${cls} text-blue-400`} />;
    case 'list_invite': return <AppIcon name="lista-mais" className={`${cls} text-emerald-400`} />;
    case 'list_update': return <AppIcon name="lista-ok" className={`${cls} text-teal-400`} />;
        default: return <AppIcon name="sino" className={`${cls} text-white/30`} />;
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

function MoreMenu({ notification, onDelete, onRead }: {
  notification: Notification;
  onDelete: (id: string) => void;
  onRead: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent) { if (e.key === 'Escape') setOpen(false); return; }
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close); };
  }, [open]);

  return (
    <div className="relative" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        aria-label="Ações da notificação"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-11 h-11 grid place-items-center rounded-full text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" />
        </svg>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-11 z-20 min-w-[200px] rounded-xl border border-white/[0.1] bg-[#111] p-1 shadow-xl">
          {!notification.read && (
            <button role="menuitem" type="button"
              onClick={() => { onRead(notification.id); setOpen(false); }}
              className="flex w-full items-center gap-2 min-h-[44px] px-3 rounded-lg text-sm text-white/80 hover:bg-white/[0.06]">
              <AppIcon name="visto" className="h-4 w-4" /> Marcar como lida
            </button>
          )}
          <button role="menuitem" type="button"
            onClick={() => { onDelete(notification.id); setOpen(false); }}
            className="flex w-full items-center gap-2 min-h-[44px] px-3 rounded-lg text-sm text-[var(--error)] hover:bg-white/[0.06]">
            <AppIcon name="apagar" className="h-4 w-4" /> Apagar notificação
          </button>
        </div>
      )}
    </div>
  );
}

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
    <motion.li
      variants={ITEM_VARIANTS}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
      className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3 pl-4 pr-1 border-b border-white/[0.06] last:border-b-0 cursor-pointer hover:bg-white/[0.03] transition-colors"
      onClick={handleClick}
      role="link"
      tabIndex={0}
      aria-label={notification.title}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleClick(); } }}
    >
      {!notification.read && (
        <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full" style={{ background: accentColor }} />
      )}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${notification.read ? 'bg-white/[0.03]' : 'bg-white/[0.06]'}`}>
        {getNotificationIcon(notification.type, 'md')}
      </div>
      <div className="min-w-0 grid grid-cols-[minmax(0,1fr)] gap-0.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className={`flex-1 min-w-0 truncate text-[15px] leading-snug ${
            notification.read ? 'text-white/55 font-medium' : 'text-white font-semibold'
          }`}>{notification.title}</span>
          <span className="flex-none text-xs text-white/40 whitespace-nowrap">{formatTimeAgo(notification.created_at)}</span>
        </div>
        <p className={`text-sm line-clamp-2 break-words ${notification.read ? 'text-white/40' : 'text-white/65'}`}>
          {notification.message}
        </p>
        {typeConfig && (
          <span className="hidden sm:inline text-[11px] font-mono" style={{ color: accentColor }}>
            {typeConfig.label}{notification.read ? '' : ' · não lida'}
          </span>
        )}
      </div>
      <div className="flex items-center gap-0.5">
        {!notification.read && (
          <span role="img" aria-label="Não lida" className="w-2 h-2 rounded-full bg-[var(--primary)]" />
        )}
        <MoreMenu notification={notification} onDelete={onDelete} onRead={onRead} />
      </div>
    </motion.li>
  );
}

function SkeletonItem() {
  return (
    <div className="flex items-start gap-3 p-4 border-b border-white/[0.06] animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex-shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="h-4 bg-white/[0.04] rounded w-2/3" />
        <div className="h-3 bg-white/[0.03] rounded w-full" />
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  usePageTitle("Notificações - FoodLister");
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const displayNotifications = notifications.filter((n) => matchesFilter(n, activeFilter));

  const handleDelete = useCallback(async (id: string) => { await deleteNotification(id); }, [deleteNotification]);
  const handleRead = useCallback(async (id: string) => { await markAsRead(id); }, [markAsRead]);

  const grouped = groupByDate(displayNotifications);

  const settingsLink = (
    <Link
      href="/users/settings/notifications"
      aria-label="Preferências de notificações"
      className="w-11 h-11 grid place-items-center rounded-full border border-white/[0.1] text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
    >
      <AppIcon name="definicoes" className="h-5 w-5" />
    </Link>
  );

  return (
    <ErrorBoundary pageName="Notifications">
      <div className="min-h-[100dvh] bg-[var(--background)]">
        <Navbar />
        <Container variant="wide" className="py-6 sm:py-10">
          <PageHeader
            title="Notificações"
            subtitle={unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}` : 'Todas lidas'}
            backLink="/restaurants"
            action={
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-2 px-4 rounded-full border border-white/[0.1] text-white/80 text-sm font-semibold hover:bg-white/[0.06] transition-colors min-h-[44px]"
                  >
                    <AppIcon name="visto" className="h-4 w-4" />
                    Marcar todas como lidas
                  </button>
                )}
                {settingsLink}
              </div>
            }
          />

          <div className="mt-6 lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-10 lg:items-start">
            {/* Filtros: chips (mobile) / barra lateral (desktop) */}
            <nav aria-label="Filtros" className="mb-5 lg:mb-0 lg:sticky lg:top-28">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
                {FILTER_GROUPS.map((tab) => {
                  const isActive = activeFilter === tab.key;
                  const count = countFor(notifications, tab.key);
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setActiveFilter(tab.key)}
                      className={`flex items-center justify-between gap-2 px-4 text-sm font-medium whitespace-nowrap transition-colors min-h-[44px] rounded-full lg:rounded-xl lg:text-left ${
                        isActive
                          ? 'bg-[var(--primary)] text-black lg:bg-[rgba(245,158,11,0.12)] lg:text-[var(--primary)]'
                          : 'bg-white/[0.04] text-white/60 hover:bg-white/[0.08] lg:bg-transparent'
                      }`}
                    >
                      {tab.label}
                      <span className="text-xs font-mono opacity-70">{count}</span>
                    </button>
                  );
                })}
              </div>
              <Link href="/users/settings/notifications" className="hidden lg:flex items-center gap-2 min-h-[44px] mt-3 pt-3 border-t border-white/[0.06] px-4 text-[13px] text-white/50 hover:text-white">
                <AppIcon name="definicoes" className="h-4 w-4" /> Preferências de notificações
              </Link>
            </nav>

            <div>
              {loading && displayNotifications.length === 0 ? (
                <div className="rounded-[18px] border border-white/[0.08] bg-white/[0.02] overflow-hidden">
                  {[...Array(3)].map((_, i) => <SkeletonItem key={i} />)}
                </div>
              ) : displayNotifications.length === 0 ? (
                <EmptyState
                  mascot={activeFilter === 'unread' ? 'feliz' : 'a-dormir'}
                  title={activeFilter === 'unread' ? 'Sem notificações não lidas' : 'Sem notificações'}
                  description={activeFilter === 'unread'
                    ? 'Estás a dia com tudo. Boa!'
                    : 'Quando receberes notificações, elas aparecem aqui.'}
                  action={<Link href="/restaurants" className="inline-flex items-center justify-center gap-2 px-5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors">Explorar restaurantes</Link>}
                />
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFilter}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="rounded-[18px] border border-white/[0.08] bg-white/[0.02] overflow-hidden"
                  >
                    {grouped.map((group) => (
                      <section key={group.label} className="[&+&]:border-t [&+&]:border-white/[0.06]">
                        <h2 className="px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.06] text-xs font-mono uppercase tracking-wider text-white/50">
                          {group.label}
                        </h2>
                        <ul>
                          {group.items.map((notification) => (
                            <NotificationItem
                              key={notification.id}
                              notification={notification}
                              onDelete={handleDelete}
                              onRead={handleRead}
                            />
                          ))}
                        </ul>
                      </section>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </Container>
      </div>
    </ErrorBoundary>
  );
}
