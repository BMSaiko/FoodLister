"use client";

import React from "react";
import { Bell, CalendarPlus, Clock, Star, MessageCircle, ListPlus, ListChecks } from "lucide-react";
import type { Notification } from "@/types/notification";

const iconMap: Record<string, { icon: React.ComponentType<{ className?: string }>; bg: string; color: string }> = {
  meal_invitation: { icon: CalendarPlus, bg: "bg-amber-500/10", color: "text-amber-400" },
  meal_reminder: { icon: Clock, bg: "bg-orange-500/10", color: "text-orange-400" },
  review_created: { icon: Star, bg: "bg-yellow-500/10", color: "text-yellow-400" },
  comment_reply: { icon: MessageCircle, bg: "bg-blue-500/10", color: "text-blue-400" },
  list_invite: { icon: ListPlus, bg: "bg-emerald-500/10", color: "text-emerald-400" },
  list_update: { icon: ListChecks, bg: "bg-teal-500/10", color: "text-teal-400" },
  system: { icon: Bell, bg: "bg-white/5", color: "text-white/40" },
};

interface NotificationItemProps {
  notification: Notification;
  onSelect: (n: Notification) => void;
}

function formatTimeAgo(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return mins + "min";
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + "h";
  const days = Math.floor(hours / 24);
  if (days < 7) return days + "d";
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return weeks + "sem";
  return Math.floor(days / 30) + "m";
}

export default function NotificationItem({ notification, onSelect }: NotificationItemProps) {
  const typeConfig = iconMap[notification.type] || iconMap["system"];
  const Icon = typeConfig.icon;
  const isUnread = !notification.read;

  return (
    <button
      onClick={() => onSelect(notification)}
      className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left hover:bg-white/[0.04] focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:bg-amber-500/5"
    >
      {isUnread && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-500" />
      )}
      <div className={"w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 " + typeConfig.bg}>
        <Icon className={"h-4 w-4 " + typeConfig.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/85 font-medium truncate">{notification.title}</p>
        {notification.message && (
          <p className="text-xs text-white/40 truncate">{notification.message}</p>
        )}
      </div>
      <span className="text-[10px] text-white/25 flex-shrink-0">
        {formatTimeAgo(notification.created_at)}
      </span>
    </button>
  );
}
