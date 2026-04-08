'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Trash2, Utensils, Loader2, Filter } from 'lucide-react';
import Navbar from '@/components/ui/navigation/Navbar';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAllNotifications, Notification } from '@/hooks/data/useAllNotifications';
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
        return <Utensils className="h-5 w-5 text-primary" />;
      default:
        return <Bell className="h-5 w-5 text-foreground-secondary" />;
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
    <div className="min-h-screen bg-background-secondary">
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
                ? 'bg-primary-lighter text-primary-dark'
                : 'bg-gray-100 text-foreground-secondary hover:bg-gray-200'
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
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <span className="ml-3 text-foreground-secondary">A carregar notificações...</span>
            </div>
          ) : displayNotifications.length === 0 ? (
            <div className="card p-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {showUnreadOnly ? 'Sem notificações não lidas' : 'Sem notificações'}
              </h3>
              <p className="text-foreground-secondary text-sm">
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
                className={`card p-4 cursor-pointer transition-all hover:shadow-lg ${
                  notification.read ? '' : 'border-primary-light'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      notification.read ? 'bg-gray-100' : 'bg-primary-lighter'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{notification.title}</p>
                        <p className="text-sm text-foreground-secondary mt-1">{notification.message}</p>
                        <p className="text-xs text-foreground-muted mt-2">{formatTimeAgo(notification.created_at)}</p>
                      </div>
                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDelete(e, notification.id)}
                        className="flex-shrink-0 p-2 text-foreground-muted hover:text-error transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label="Eliminar notificação"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {/* Status badge */}
                    {!notification.read && (
                      <span className="inline-block mt-2 px-2.5 py-1 bg-primary-lighter text-primary-dark text-xs font-medium rounded-full">
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
  );
}