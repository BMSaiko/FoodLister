'use client';

import { useAdminStats } from '@/hooks/admin/useAdminStats';
import StatsCard from '@/components/admin/StatsCard';
import GrowthChart from '@/components/admin/GrowthChart';
import { Users, UtensilsCrossed, Star, List, Calendar, Shield } from 'lucide-react';

export default function AdminStatisticsPage() {
  const { stats, loading, error } = useAdminStats();

  if (loading) return <p style={{ color: 'var(--muted-foreground)' }}>A carregar estatísticas...</p>;
  if (error) return <p className="text-red-500">Erro: {error}</p>;
  if (!stats) return <p style={{ color: 'var(--muted-foreground)' }}>Sem dados disponíveis</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Estatísticas Detalhadas</h1>

      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Utilizadores</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard title="Total" value={stats.users.total} icon={Users} />
          <StatsCard title="Novos este mês" value={stats.users.newThisMonth} />
          <StatsCard title="Admins" value={stats.users.admins} icon={Shield} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Restaurantes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard title="Total" value={stats.restaurants.total} icon={UtensilsCrossed} />
          <StatsCard title="Rating médio" value={stats.restaurants.averageRating} />
          <StatsCard title="Novos este mês" value={stats.restaurants.newThisMonth} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard title="Total" value={stats.reviews.total} icon={Star} />
          <StatsCard title="Rating médio" value={stats.reviews.averageRating} />
          <StatsCard title="Novos este mês" value={stats.reviews.newThisMonth} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Listas</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard title="Total" value={stats.lists.total} icon={List} />
          <StatsCard title="Públicas" value={stats.lists.public} />
          <StatsCard title="Privadas" value={stats.lists.private} />
          <StatsCard title="Colaborativas" value={stats.lists.collaborative} />
        </div>
      </div>

      {stats.growth && <GrowthChart data={stats.growth} />}
    </div>
  );
}

