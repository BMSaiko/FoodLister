'use client';

import { useAdminStats } from '@/hooks/admin/useAdminStats';
import StatsCard from '@/components/admin/StatsCard';
import GrowthChart from '@/components/admin/GrowthChart';
import { Users, UtensilsCrossed, Star, List, Shield } from 'lucide-react';

export default function AdminStatisticsPage() {
  const { stats, loading, error } = useAdminStats();

  if (loading) return <p className="text-foreground-muted">A carregar estatísticas...</p>;
  if (error) return <p className="text-red-400">Erro: {error}</p>;
  if (!stats) return <p className="text-foreground-muted">Sem dados disponíveis</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Estatísticas Detalhadas</h1>

      <div>
        <h2 className="text-lg font-semibold mb-3 text-foreground">Utilizadores</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard title="Total" value={stats.users.total} icon={Users} />
          <StatsCard title="Novos este mês" value={stats.users.newThisMonth} />
          <StatsCard title="Admins" value={stats.users.admins} icon={Shield} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 text-foreground">Restaurantes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard title="Total" value={stats.restaurants.total} icon={UtensilsCrossed} />
          <StatsCard title="Rating médio" value={stats.restaurants.averageRating} />
          <StatsCard title="Novos este mês" value={stats.restaurants.newThisMonth} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 text-foreground">Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard title="Total" value={stats.reviews.total} icon={Star} />
          <StatsCard title="Rating médio" value={stats.reviews.averageRating} />
          <StatsCard title="Novos este mês" value={stats.reviews.newThisMonth} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 text-foreground">Listas</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard title="Total" value={stats.lists.total} icon={List} />
          <StatsCard title="Públicas" value={stats.lists.public} />
          <StatsCard title="Privadas" value={stats.lists.private} />
          <StatsCard title="Colaborativas" value={stats.lists.collaborative} />
        </div>
      </div>

      {stats.growth && <GrowthChart data={stats.growth} />}

      {/* Leaderboard + popular lists (ponytail: reuse stats already fetched) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-lg font-semibold mb-3 text-foreground">Top Restaurantes</h2>
          <div className="rounded-xl border border-white/10 bg-card overflow-hidden">
            {stats.topRestaurants?.length ? (
              <ul className="divide-y divide-white/5">
                {stats.topRestaurants.map((r: any, i: number) => (
                  <li key={r.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span className="text-foreground-muted mr-2">{i + 1}.</span>
                    <span className="flex-1 text-foreground truncate">{r.name}</span>
                    <span className="text-amber-400/80 text-xs">★ {r.score ?? r.rating}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="p-4 text-sm text-foreground-muted">Sem dados.</p>}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-3 text-foreground">Listas Populares</h2>
          <div className="rounded-xl border border-white/10 bg-card overflow-hidden">
            {stats.topLists?.length ? (
              <ul className="divide-y divide-white/5">
                {stats.topLists.map((l: any, i: number) => (
                  <li key={l.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span className="text-foreground-muted mr-2">{i + 1}.</span>
                    <span className="flex-1 text-foreground truncate">{l.name}</span>
                    <span className="text-emerald-400/80 text-xs">{l.count} itens</span>
                  </li>
                ))}
              </ul>
            ) : <p className="p-4 text-sm text-foreground-muted">Sem dados.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
