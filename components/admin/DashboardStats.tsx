'use client';

import type { DashboardStats as Stats } from '@/libs/types';
import StatsCard from './StatsCard';
import { Users, UtensilsCrossed, Star, List, Calendar } from 'lucide-react';

interface DashboardStatsProps {
  stats: Stats | null;
  loading: boolean;
}

export default function DashboardStats({ stats, loading }: DashboardStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-[2rem] p-6 animate-pulse bg-white/[0.03] ring-1 ring-white/5">
            <div className="h-3 w-20 rounded-full bg-white/10 mb-3" />
            <div className="h-8 w-14 rounded-lg bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2">
        <StatsCard title="Utilizadores" value={stats.users.total} icon={Users} trend={stats.users.growthRate} subtitle={`+${stats.users.newThisMonth} este mês`} delay={0} />
      </div>
      <div className="lg:col-span-1">
        <StatsCard title="Restaurantes" value={stats.restaurants.total} icon={UtensilsCrossed} subtitle={`+${stats.restaurants.newThisMonth} este mês`} delay={100} />
      </div>
      <div className="lg:col-span-1">
        <StatsCard title="Reviews" value={stats.reviews.total} icon={Star} subtitle={`Média: ${stats.reviews.averageRating}`} delay={200} />
      </div>
      <div className="lg:col-span-1">
        <StatsCard title="Listas" value={stats.lists.total} icon={List} subtitle={`${stats.lists.public} públicas`} delay={300} />
      </div>
    </div>
  );
}
