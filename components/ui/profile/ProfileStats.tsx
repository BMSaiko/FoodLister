"use client";

import React from "react";
import { Star, List, UtensilsCrossed, Eye } from "lucide-react";

interface ProfileStatsProps {
  totalRestaurantsVisited: number;
  totalReviews: number;
  totalLists: number;
  totalRestaurantsAdded: number;
}

const STAT_CONFIG = [
  { key: "visited", label: "Visitados", icon: UtensilsCrossed, color: "text-amber-400", bg: "bg-amber-500/10" },
  { key: "reviews", label: "Reviews", icon: Star, color: "text-blue-400", bg: "bg-blue-500/10" },
  { key: "lists", label: "Listas", icon: List, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { key: "added", label: "Adicionados", icon: Eye, color: "text-purple-400", bg: "bg-purple-500/10" },
];

export default function ProfileStats({ totalRestaurantsVisited, totalReviews, totalLists, totalRestaurantsAdded }: ProfileStatsProps) {
  const values: Record<string, number> = { visited: totalRestaurantsVisited, reviews: totalReviews, lists: totalLists, added: totalRestaurantsAdded };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {STAT_CONFIG.map(stat => (
        <div key={stat.key} className="p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <div className="p-3 md:p-4 rounded-xl bg-white/[0.03] text-center">
            <div className={`w-8 h-8 mx-auto mb-2 rounded-lg ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className="text-xl md:text-2xl font-bold text-white/85">{values[stat.key] ?? 0}</p>
            <p className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
