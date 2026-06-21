'use client';

import { useAdminStats } from '@/hooks/admin/useAdminStats';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import DashboardStats from '@/components/admin/DashboardStats';
import GrowthChart from '@/components/admin/GrowthChart';
import Link from 'next/link';
import { Users, UtensilsCrossed, Star, ArrowUpRight, RefreshCw } from 'lucide-react';

export default function AdminDashboardPage() {
  const { stats, loading, error, refresh } = useAdminStats();

  return (
    <ErrorBoundary pageName="Admin">
      <div className="space-y-8 max-w-7xl mx-auto" style={{ animation: 'fadeUp 600ms ease forwards' }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-400/60 mb-2">Painel de Administração</p>
            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          </div>
          <button
            onClick={refresh}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 ring-1 ring-white/10 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors duration-150"
          >
            {loading ? (
              <span className='w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin' style={{ animationDuration: '1s' }} />
            ) : (
              <RefreshCw className='w-4 h-4' />
            )}
            Atualizar
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 text-red-400 text-sm">
            Erro: {error}
          </div>
        )}

        {/* Stats Cards — Bento Grid */}
        <DashboardStats stats={stats} loading={loading} />

        {/* Charts + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {stats?.growth && <GrowthChart data={stats.growth} />}
          </div>

          {/* Quick Actions */}
          <div
            className="group relative p-1.5 rounded-[2rem]"
            style={{ animation: 'fadeUp 800ms ease forwards', opacity: 0, animationDelay: '500ms' }}
          >
            <div className="absolute inset-0 rounded-[2rem] bg-white/[0.05] ring-1 ring-white/10 backdrop-blur-xl" />
            <div className="relative rounded-[calc(2rem-0.375rem)] p-6 bg-gradient-to-br from-[#0a0a0a] to-[#111111] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
              <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-white/40 mb-6">Ações Rápidas</h3>
              <div className="space-y-3">
                <Link
                  href="/admin/users"
                  className="group/item flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] ring-1 ring-white/5 hover:bg-white/[0.08] hover:ring-white/15 transition-colors duration-150"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Gerir Utilizadores</p>
                    <p className="text-xs text-white/30">{stats?.users.total || 0} utilizadores</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-white/20 group-hover/item:text-amber-400 " />
                </Link>
                <Link
                  href="/admin/restaurants"
                  className="group/item flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] ring-1 ring-white/5 hover:bg-white/[0.08] hover:ring-white/15 transition-colors duration-150"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <UtensilsCrossed className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Gerir Restaurantes</p>
                    <p className="text-xs text-white/30">{stats?.restaurants.total || 0} restaurantes</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-white/20 group-hover/item:text-emerald-400 " />
                </Link>
                <Link
                  href="/admin/reviews"
                  className="group/item flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] ring-1 ring-white/5 hover:bg-white/[0.08] hover:ring-white/15 transition-colors duration-150"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Star className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Moderar Reviews</p>
                    <p className="text-xs text-white/30">{stats?.reviews.total || 0} reviews</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-white/20 group-hover/item:text-blue-400 " />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
