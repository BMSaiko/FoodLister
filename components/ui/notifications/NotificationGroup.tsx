"use client";

import React from "react";
import type { Notification } from "@/types/notification";
import NotificationItem from "./NotificationItem";

function getRelativeGroup(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfThisWeek = new Date(startOfToday);
  startOfThisWeek.setDate(startOfThisWeek.getDate() - now.getDay());

  const dateMs = date.getTime();

  if (dateMs >= startOfToday.getTime()) return "Hoje";
  if (dateMs >= startOfYesterday.getTime()) return "Ontem";
  if (dateMs >= startOfThisWeek.getTime()) return "Esta semana";
  return "Mais antigo";
}

export function groupByDate(notifications: Notification[]): Map<string, Notification[]> {
  const groups = new Map<string, Notification[]>();
  
  for (const n of notifications) {
    const group = getRelativeGroup(n.created_at);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(n);
  }

  // Order: Hoje > Ontem > Esta semana > Mais antigo
  const order = ["Hoje", "Ontem", "Esta semana", "Mais antigo"];
  const ordered = new Map<string, Notification[]>();
  for (const key of order) {
    if (groups.has(key)) ordered.set(key, groups.get(key)!);
  }
  return ordered;
}

interface NotificationGroupProps {
  label: string;
  notifications: Notification[];
  onSelect: (n: Notification) => void;
}

export { default as NotificationItem } from "./NotificationItem";

export default function NotificationGroup({ label, notifications, onSelect }: NotificationGroupProps) {
  return (
    <div role="group" aria-label={label}>
      {/* Sticky group header */}
      <div className="sticky top-0 z-10 bg-[var(--card-bg)]/95 backdrop-blur-sm px-4 py-2 border-b border-white/[0.04]">
        <span className="text-[10px] uppercase tracking-wider text-white/25 font-medium">
          {label}
        </span>
      </div>

      {/* Items */}
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} onSelect={onSelect} />
      ))}
    </div>
  );
}
