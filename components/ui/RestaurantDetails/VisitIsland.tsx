import React, { useState, useEffect } from "react";
import { Check, X, Plus, Star, Trophy, Award, Medal } from "lucide-react";

interface VisitIslandProps {
  visited: boolean;
  visitCount: number;
  onToggleVisited: () => void;
  onAddVisit: () => void;
  onRemoveVisit: () => void;
  isUpdating: boolean;
}

export default function VisitIsland({ visited, visitCount, onToggleVisited, onAddVisit, onRemoveVisit, isUpdating }: VisitIslandProps) {
  const [animateToggle, setAnimateToggle] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [prevCount, setPrevCount] = useState(visitCount);

  useEffect(() => {
    if (visitCount > prevCount) {
      setAnimateToggle(true);
      setTimeout(() => setAnimateToggle(false), 400);
      // Check for milestone
      if (visitCount === 1 || visitCount === 5 || visitCount === 10 || visitCount === 20) {
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 2000);
      }
    }
    setPrevCount(visitCount);
  }, [visitCount]);

  const getMilestone = (count: number) => {
    if (count >= 20) return { label: "Explorador de Ouro", icon: Trophy, color: "text-amber-400", ring: "ring-amber-500/30", next: null, progress: 100 };
    if (count >= 10) return { label: "Explorador de Prata", icon: Award, color: "text-gray-300", ring: "ring-gray-400/30", next: 20, progress: (count / 20) * 100 };
    if (count >= 5) return { label: "Explorador de Bronze", icon: Medal, color: "text-amber-600", ring: "ring-amber-600/30", next: 10, progress: (count / 10) * 100 };
    if (count >= 1) return { label: "Primeira Visita", icon: Star, color: "text-amber-400", ring: "ring-amber-500/30", next: 5, progress: (count / 5) * 100 };
    return null;
  };

  const milestone = getMilestone(visitCount);

  return (
    <section className="mb-8">
      <div className="p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
        <div className="p-4 md:p-5 rounded-2xl bg-white/[0.03]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Toggle with spring */}
            <button
              onClick={onToggleVisited}
              disabled={isUpdating}
              className={
                "flex items-center gap-3 px-5 py-3 rounded-full text-sm font-semibold min-h-[48px] transition-all " +
                (isUpdating
                  ? "bg-amber-500/20 text-amber-400 animate-pulse"
                  : visited
                  ? "bg-emerald-500/12 text-emerald-400 ring-1 ring-emerald-500/25 hover:bg-emerald-500/20"
                  : "bg-white/[0.05] text-white/55 ring-1 ring-white/[0.08] hover:bg-white/[0.08]") +
                (animateToggle ? " scale-110" : " scale-100")
              }
              style={{ transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s" }}
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
              <div className="flex items-center gap-2.5 bg-white/[0.03] rounded-full px-4 py-2 ring-1 ring-white/[0.06]">
                <button onClick={onRemoveVisit} disabled={visitCount <= 0} className="flex items-center justify-center w-8 h-8 bg-red-500/12 text-red-400 rounded-full hover:bg-red-500/20 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110">
                  <X className="h-4 w-4" />
                </button>
                <div className="text-center min-w-[44px]">
                  <span className="text-xl font-bold text-amber-400 tabular-nums transition-all duration-300">{visitCount}</span>
                  <span className="block text-[9px] text-white/25 -mt-0.5 uppercase tracking-wider">visitas</span>
                </div>
                <button onClick={onAddVisit} className="flex items-center justify-center w-8 h-8 bg-amber-500/12 text-amber-400 rounded-full hover:bg-amber-500/20 transition-all duration-200 hover:scale-110">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Milestone */}
            {milestone && (
              <div className={`flex items-center gap-2.5 ml-auto transition-all duration-500 ${celebrate ? "scale-110" : "scale-100"}`}>
                <div className={`p-2 rounded-xl bg-white/[0.04] ring-1 ${milestone.ring} transition-all duration-300`}>
                  <milestone.icon className={`h-5 w-5 ${milestone.color}`} />
                </div>
                <div>
                  <span className={`text-sm font-semibold ${milestone.color}`}>{milestone.label}</span>
                  {milestone.next && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500/50 rounded-full transition-all duration-500" style={{ width: `${milestone.progress}%` }} />
                      </div>
                      <span className="text-[10px] text-white/25">{visitCount}/{milestone.next}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
