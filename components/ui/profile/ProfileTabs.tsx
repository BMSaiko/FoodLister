"use client";

import React from "react";
import { motion } from "motion/react";
import { Star, List, UtensilsCrossed, Calendar, Clock } from "lucide-react";

const TAB_CONFIG = [
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "lists", label: "Listas", icon: List },
  { key: "restaurants", label: "Restaurantes", icon: UtensilsCrossed },
  { key: "meals", label: "Refeições", icon: Calendar },
  { key: "activity", label: "Atividade", icon: Clock },
] as const;

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: Record<string, number>;
}

export default function ProfileTabs({ activeTab, onTabChange, counts }: ProfileTabsProps) {
  return (
    <div className="border-b border-white/[0.06] mb-0">
      <div className="flex overflow-x-auto scrollbar-hide">
        {TAB_CONFIG.map(tab => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`relative flex items-center gap-2 px-4 md:px-5 py-3.5 text-sm font-medium transition-colors whitespace-nowrap min-h-[48px] ${
                isActive ? "text-purple-400" : "text-white/35 hover:text-white/60"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {(counts[tab.key] ?? 0) > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? "bg-purple-500/15 text-purple-400" : "bg-white/[0.06] text-white/30"
                }`}>
                  {counts[tab.key]}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="profile-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
