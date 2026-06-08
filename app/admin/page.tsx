'use client';

import { useAdminStats } from '@/hooks/admin/useAdminStats';
import DashboardStats from '@/components/admin/DashboardStats';
import GrowthChart from '@/components/admin/GrowthChart';
import Link from 'next/link';
import { Users, UtensilsCrossed, Star } from 'lucide-react';

export default function AdminDashboardPage() {
  const { stats, loading, error, refresh } = useAdminStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Dashboard</h1>
        <button onClick={refresh} className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
          Atualizar
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">Erro: {error}</p>}

      <DashboardStats stats={stats} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats?.growth && <GrowthChart data={stats.growth} />}
        {stats?.reviews && (
          <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Distribuição de Ratings</h3>
            <div className="space-y-2">
              {stats.reviews.byRating.map(r => (
                <div key={r.rating} className="flex items-center gap-2">
                  <span className="text-sm w-8" style={{ color: 'var(--muted-foreground)' }}>{'⭐'.repeat(r.rating)}</span>
                  <div className="flex-1 h-6 rounded" style={{ backgroundColor: 'var(--muted)' }}>
                    <div className="h-full rounded" style={{ backgroundColor: 'var(--primary)', width: `${stats.reviews.total ? (r.count / stats.reviews.total * 100) : 0}%` }} />
                  </div>
                  <span className="text-sm w-12 text-right" style={{ color: 'var(--foreground)' }}>{r.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/users" className="flex items-center gap-3 p-4 rounded-xl border transition-colors hover:opacity-80" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <Users className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          <div>
            <p className="font-medium" style={{ color: 'var(--foreground)' }}>Gerir Utilizadores</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{stats?.users.total || 0} utilizadores</p>
          </div>
        </Link>
        <Link href="/admin/restaurants" className="flex items-center gap-3 p-4 rounded-xl border transition-colors hover:opacity-80" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <UtensilsCrossed className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          <div>
            <p className="font-medium" style={{ color: 'var(--foreground)' }}>Gerir Restaurantes</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{stats?.restaurants.total || 0} restaurantes</p>
          </div>
        </Link>
        <Link href="/admin/reviews" className="flex items-center gap-3 p-4 rounded-xl border transition-colors hover:opacity-80" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <Star className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          <div>
            <p className="font-medium" style={{ color: 'var(--foreground)' }}>Moderar Reviews</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{stats?.reviews.total || 0} reviews</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

