"use client";

import React from "react";
import { Calendar, Clock, Users, Utensils } from "lucide-react";

interface ConfirmStepProps {
  restaurantName: string;
  date: string;
  time: string;
  duration: number;
  mealType: string;
  participantCount: number;
  googleCalendar: boolean;
  onToggleCalendar: () => void;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "Data nao definida";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
}

function formatDuration(mins: number): string {
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h${m}min` : `${h}h`;
  }
  return `${mins}min`;
}

export default function ConfirmStep({
  restaurantName,
  date,
  time,
  duration,
  mealType,
  participantCount,
  googleCalendar,
  onToggleCalendar,
}: ConfirmStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-medium text-white/80 mb-4">Confirmar detalhes</h3>

        <div className="space-y-3 bg-white/0.02 rounded-xl p-4 border border-white/0.06">
          <div className="flex items-center gap-3">
            <Utensils className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <span className="text-sm text-white/85">{restaurantName}</span>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-white/30 flex-shrink-0" />
            <span className="text-sm text-white/70">{formatDate(date)}</span>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-white/30 flex-shrink-0" />
            <span className="text-sm text-white/70">{time} ({formatDuration(duration)})</span>
          </div>

          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-white/30 flex-shrink-0" />
            <span className="text-sm text-white/70">{participantCount} participante{participantCount !== 1 ? "s" : ""}</span>
          </div>

          {mealType && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40">Tipo:</span>
              <span className="text-xs text-white/60 bg-white/0.04 px-2 py-0.5 rounded-full">{mealType}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between bg-white/0.02 rounded-xl p-4 border border-white/0.06">
        <div>
          <p className="text-sm text-white/70">Adicionar ao Google Calendar</p>
          <p className="text-xs text-white/30">Criar evento automaticamente</p>
        </div>
        <button
          onClick={onToggleCalendar}
          className={"relative w-11 h-6 rounded-full transition-colors duration-200 " +
            (googleCalendar ? "bg-amber-500" : "bg-white/10")}
          aria-label="Toggle Google Calendar"
        >
          <span
            className={"absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 " +
              (googleCalendar ? "translate-x-5" : "translate-x-0.5")}
          />
        </button>
      </div>
    </div>
  );
}
