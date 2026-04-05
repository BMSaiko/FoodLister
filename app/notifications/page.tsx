'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Check, Trash2, Utensils, Loader2, ArrowLeft, Filter } from 'lucide-react';
import Navbar from '@/components/ui/navigation/Navbar';
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
        return <Utensils className="h-5 w-5 text-amber-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-amber-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Bell className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
                  {unreadCount > 0 && (
                    <p className="text-amber-700 text-sm">{unreadCount} não lida(s)</p>
                  )}
                </div>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center space-x-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
                >
                  <Check className="h-4 w-4" />
                  <span>Marcar todas como lidas</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter */}
          <div className="px-6 py-4 border-b border-gray-100">
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                showUnreadOnly
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>{showUnreadOnly ? 'Apenas não lidas' : 'Todas as notificações'}</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading && displayNotifications.length === 0 ? (
            <div className="flex items-center justify-center py-12 bg-white rounded-xl shadow-sm">
              <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
              <span className="ml-3 text-gray-600">A carregar notificações...</span>
            </div>
          ) : displayNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl shadow-sm text-center">
              <Bell className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {showUnreadOnly ? 'Sem notificações não lidas' : 'Sem notificações'}
              </h3>
              <p className="text-gray-500 text-sm">
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
                className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                  notification.read ? '' : 'border-amber-200'
                }`}
              >
                <div className="flex items-start gap-4 p-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      notification.read ? 'bg-gray-100' : 'bg-amber-100'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">{formatTimeAgo(notification.created_at)}</p>
                      </div>
                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDelete(e, notification.id)}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {/* Status badge */}
                    {!notification.read && (
                      <span className="inline-block mt-2 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        Não lida
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}