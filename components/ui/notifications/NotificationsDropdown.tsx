"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell } from "lucide-react";
import useNotifications from "@/hooks/data/useNotifications";
import type { Notification } from "@/types/notification";
import NotificationGroup, { groupByDate } from "./NotificationGroup";
import NotificationEmptyState from "./NotificationEmptyState";

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotifications({ unreadOnly: false, limit: 50 });

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      const timer = setTimeout(() => {
        markAllAsRead();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, unreadCount, markAllAsRead]);

  const handleSelect = async (n: Notification) => {
    if (!n.read) markAsRead(n.id);
  };

  const grouped = groupByDate(notifications);
  const hasNotifications = notifications.length > 0;
  const ariaLabel = unreadCount > 0
    ? "Notificacoes (" + unreadCount + " novas)"
    : "Notificacoes";

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={toggle}
        className="relative w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
      >
        <Bell className="h-4 w-4 text-white/70" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-amber-500 text-black text-[10px] font-bold px-1 ring-2 ring-[var(--background)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-[var(--card-bg)] ring-1 ring-white/[0.08] rounded-2xl shadow-2xl overflow-hidden z-50"
          role="listbox"
          aria-label="Lista de notificacoes"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <h3 className="text-sm font-medium text-white/80">Notificacoes</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-amber-400/70 hover:text-amber-400 transition-colors"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Content */}
          <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: "min(50vh, 360px)" }}>
            {!hasNotifications && !loading ? (
              <NotificationEmptyState />
            ) : loading && !hasNotifications ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-white/10 border-t-amber-500 rounded-full animate-spin" />
              </div>
            ) : (
              Array.from(grouped.entries()).map(([label, items]) => (
                <NotificationGroup key={label} label={label} notifications={items} onSelect={handleSelect} />
              ))
            )}
          </div>

          {/* Footer */}
          {hasNotifications && (
            <div className="px-4 py-2 border-t border-white/[0.06] text-center">
              <span className="text-[10px] text-white/25">{notifications.length} notificacoes</span>
            </div>
          )}
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
