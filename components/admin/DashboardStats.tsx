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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-xl border p-6 animate-pulse" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="h-4 w-24 rounded mb-2" style={{ backgroundColor: 'var(--muted)' }} />
            <div className="h-8 w-16 rounded" style={{ backgroundColor: 'var(--muted)' }} />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatsCard title="Utilizadores" value={stats.users.total} icon={Users} trend={stats.users.growthRate} subtitle={`+${stats.users.newThisMonth} este mês`} />
      <StatsCard title="Restaurantes" value={stats.restaurants.total} icon={UtensilsCrossed} subtitle={`+${stats.restaurants.newThisMonth} este mês`} />
      <StatsCard title="Reviews" value={stats.reviews.total} icon={Star} subtitle={`Média: ${stats.reviews.averageRating}`} />
      <StatsCard title="Listas" value={stats.lists.total} icon={List} subtitle={`${stats.lists.public} públicas`} />
      <StatsCard title="Refeições" value={stats.meals.total} icon={Calendar} subtitle={`${stats.meals.upcoming} próximas`} />
    </div>
  );
}

