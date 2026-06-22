import React from "react";
import { Check, X, Plus, Star } from "lucide-react";

interface VisitIslandProps {
  visited: boolean;
  visitCount: number;
  onToggleVisited: () => void;
  onAddVisit: () => void;
  onRemoveVisit: () => void;
  isUpdating: boolean;
}

export default function VisitIsland({
  visited,
  visitCount,
  onToggleVisited,
  onAddVisit,
  onRemoveVisit,
  isUpdating
}: VisitIslandProps) {
  // Milestone badges
  const getMilestone = (count: number) => {
    if (count >= 20) return { label: "Explorador de Ouro", emoji: "🏆", color: "text-amber-400" };
    if (count >= 10) return { label: "Explorador de Prata", emoji: "🥈", color: "text-gray-300" };
    if (count >= 5) return { label: "Explorador de Bronze", emoji: "🥉", color: "text-amber-600" };
    if (count >= 1) return { label: "Primeira Visita", emoji: "⭐", color: "text-amber-400" };
    return null;
  };

  const milestone = getMilestone(visitCount);

  return (
    <section className="mb-6">
      <div className="p-5 bg-white/[0.03] rounded-2xl ring-1 ring-white/[0.06]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Toggle */}
          <button
            onClick={onToggleVisited}
            disabled={isUpdating}
            className={
              "flex items-center gap-3 px-5 py-3 rounded-full text-sm font-semibold transition-all duration-200 min-h-[48px] " +
              (isUpdating
                ? "bg-amber-500/20 text-amber-400 animate-pulse"
                : visited
                ? "bg-green-500/15 text-green-400 ring-1 ring-green-500/30 hover:bg-green-500/25"
                : "bg-white/[0.06] text-white/60 ring-1 ring-white/10 hover:bg-white/[0.08]")
            }
          >
            {isUpdating ? (
              <div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-amber-400 animate-spin" />
            ) : visited ? (
              <Check className="h-5 w-5" />
            ) : (
              <X className="h-5 w-5" />
            )}
            <span>{visited ? "Visitado" : "Nao visitado"}</span>
          </button>

          {/* Counter */}
          {visited && (
            <div className="flex items-center gap-3 bg-white/[0.03] rounded-full px-4 py-2 ring-1 ring-white/[0.08]">
              <button
                onClick={onRemoveVisit}
                disabled={visitCount <= 0}
                className="flex items-center justify-center w-8 h-8 bg-red-500/15 text-red-400 rounded-full hover:bg-red-500/25 transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="text-center min-w-[40px]">
                <span className="text-xl font-bold text-amber-400 tabular-nums">{visitCount}</span>
                <span className="block text-[10px] text-white/30 -mt-0.5">visitas</span>
              </div>
              <button
                onClick={onAddVisit}
                className="flex items-center justify-center w-8 h-8 bg-amber-500/15 text-amber-400 rounded-full hover:bg-amber-500/25 transition-colors duration-150"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Milestone */}
          {milestone && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-lg">{milestone.emoji}</span>
              <span className={`text-sm font-medium ${milestone.color}`}>{milestone.label}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
