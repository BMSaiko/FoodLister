'use client';

import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: number;
  subtitle?: string;
  delay?: number;
}

export default function StatsCard({ title, value, icon: Icon, trend, subtitle, delay = 0 }: StatsCardProps) {
  return (
    <div
      className="group relative p-1.5 rounded-[2rem] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] hover:-translate-y-1"
      style={{
        animationDelay: `${delay}ms`,
        animation: 'fadeUp 800ms ease forwards',
        opacity: 0,
      }}
    >
      {/* Outer Shell — Double Bezel */}
      <div className="absolute inset-0 rounded-[2rem] bg-white/[0.05] ring-1 ring-white/10 backdrop-blur-xl" />

      {/* Inner Core */}
      <div
        className="relative rounded-[calc(2rem-0.375rem)] p-6 bg-gradient-to-br from-[#0a0a0a] to-[#111111] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
      >
        {/* Glow orb on hover */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-amber-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <div className="relative flex items-center justify-between mb-3">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/40">{title}</p>
          {Icon && (
            <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center ring-1 ring-white/10">
              <Icon className="h-4 w-4 text-amber-400" />
            </div>
          )}
        </div>
        <div className="relative flex items-baseline gap-2">
          <p className="text-3xl font-bold text-white tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend !== undefined && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs mt-2 text-white/30">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
