'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Trash2, Utensils, Loader2, Filter } from 'lucide-react';
import Navbar from '@/components/ui/navigation/Navbar';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAllNotifications, Notification } from '@/hooks/data/useAllNotifications';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { toast } from 'react-toastify';

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useAllNotifications();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [displayNotifications, setDisplayNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (showUnreadOnly) {
      setDisplayNotifications(notifications.filter(n => !n.read));
    } else {
      setDisplayNotifications(notifications);
    }
  }, [notifications, showUnreadOnly]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
    toast.success('Notificação eliminada');
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    toast.success('Todas as notificações marcadas como lidas');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'meal_invitation':
        return <Utensils className="h-5 w-5 text-purple-400" />;
      default:
        return <Bell className="h-5 w-5 text-white/90-secondary" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <ErrorBoundary pageName="Notifications">
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <Container variant="narrow" className="py-6 sm:py-8">
        <PageHeader
          title="Notificações"
          subtitle={unreadCount > 0 ? `${unreadCount} não lida(s)` : 'Todas as notificações lidas'}
          backLink="/"
          action={
            unreadCount > 0 ? (
              <button
                onClick={handleMarkAllRead}
                className="btn btn-primary btn-sm"
              >
                <Check className="h-4 w-4" />
                Marcar todas como lidas
              </button>
            ) : undefined
          }
        />

        {/* Filter */}
        <div className="mb-6">
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-[var(--radius-lg)] transition-colors text-sm font-medium min-h-[44px] ${
              showUnreadOnly
                ? 'bg-primary-lighter text-purple-400-dark'
                : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.08]'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>{showUnreadOnly ? 'Apenas não lidas' : 'Todas as notificações'}</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading && displayNotifications.length === 0 ? (
            <div className="card p-8 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
              <span className="ml-3 text-white/90-secondary">A carregar notificações...</span>
            </div>
          ) : displayNotifications.length === 0 ? (
            <div className="card p-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white/90 mb-2">
                {showUnreadOnly ? 'Sem notificações não lidas' : 'Sem notificações'}
              </h3>
              <p className="text-white/90-secondary text-sm">
                {showUnreadOnly
                  ? 'Todas as notificações já foram lidas.'
                  : 'Ainda não tens notificações.'}
              </p>
            </div>
          ) : (
            displayNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all ${
                  notification.read ? '' : 'border-primary-light'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      notification.read ? 'bg-white/[0.02]' : 'bg-purple-500/10'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white/90">{notification.title}</p>
                        <p className="text-sm text-white/90-secondary mt-1">{notification.message}</p>
                        <p className="text-xs text-white/90-muted mt-2">{formatTimeAgo(notification.created_at)}</p>
                      </div>
                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDelete(e, notification.id)}
                        className="flex-shrink-0 p-2 text-white/90-muted hover:text-error transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label="Eliminar notificação"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {/* Status badge */}
                    {!notification.read && (
                      <span className="inline-block mt-2 px-2.5 py-1 bg-primary-lighter text-purple-400-dark text-xs font-medium rounded-full">
                        Não lida
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Container>
    </div>
    </ErrorBoundary>
  );
}