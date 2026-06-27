"use client";

import React from "react";
import { Bell } from "lucide-react";

interface NotificationEmptyStateProps {
  hasQuery?: boolean;
}

export default function NotificationEmptyState({ hasQuery }: NotificationEmptyStateProps) {
  if (hasQuery) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mb-4">
          <Bell className="h-5 w-5 text-white/10" />
        </div>
        <p className="text-sm text-white/50 font-medium mb-1">Sem resultados</p>
        <p className="text-xs text-white/30">Tenta outro termo de pesquisa</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mb-4">
        <Bell className="h-5 w-5 text-white/10" />
      </div>
      <p className="text-sm text-white/60 font-medium mb-1">Tudo limpo!</p>
      <p className="text-xs text-white/30">As tuas notificacoes aparecem aqui</p>
    </div>
  );
}
