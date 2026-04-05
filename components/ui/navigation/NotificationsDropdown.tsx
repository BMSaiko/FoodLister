'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, X, Check, Trash2, Utensils, Loader2 } from 'lucide-react';
import { useNotifications, Notification } from '@/hooks/data/useNotifications';

export default function NotificationsDropdown() {
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      setIsOpen(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'meal_invitation':
        return <Utensils className="h-4 w-4 text-amber-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications(true);
        }}
        className="relative p-2 text-gray-600 hover:text-amber-600 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-20 animate-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notificações</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Marcar todas como lidas
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Sem notificações</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors ${
                      notification.read ? 'bg-white' : 'bg-amber-50/50'
                    } hover:bg-gray-50 ${notification.link ? 'hover:bg-amber-50' : ''}`}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        notification.read ? 'bg-gray-100' : 'bg-amber-100'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(notification.created_at)}</p>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={(e) => handleDelete(e, notification.id)}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                >
                  Ver todas as notificações
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}