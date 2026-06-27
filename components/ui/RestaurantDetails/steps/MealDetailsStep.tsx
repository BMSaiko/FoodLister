"use client";

import React from "react";
import { Calendar, Clock } from "lucide-react";
import { MealType } from "@/hooks/forms/useMealScheduling";

interface MealDetailsStepProps {
  date: string;
  time: string;
  duration: number;
  mealType: string;
  mealTypes: MealType[];
  onChange: (field: string, value: string | number) => void;
}

export default function MealDetailsStep({
  date,
  time,
  duration,
  mealType,
  mealTypes,
  onChange,
}: MealDetailsStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
          Data
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            type="date"
            value={date}
            onChange={(e) => onChange("date", e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white/90 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-colors [color-scheme:dark]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
          Hora
        </label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            type="time"
            value={time}
            onChange={(e) => onChange("time", e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white/90 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-colors [color-scheme:dark]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
          Tipo de refeicao
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {mealTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => onChange("mealType", type.value)}
              className={"flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors " +
                (mealType === type.value
                  ? "bg-amber-500 text-black"
                  : "bg-white/[0.04] text-white/50 hover:bg-white/[0.08]")}
            >
              {type.icon} {type.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
          Duracao (min)
        </label>
        <div className="flex gap-2">
          {[30, 60, 90, 120, 180].map((d) => (
            <button
              key={d}
              onClick={() => onChange("duration", d)}
              className={"flex-1 py-2 rounded-lg text-xs font-medium transition-colors " +
                (duration === d
                  ? "bg-amber-500 text-black"
                  : "bg-white/[0.04] text-white/50 hover:bg-white/[0.08]")}
            >
              {d >= 60 ? Math.floor(d / 60) + "h" : d + "min"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
