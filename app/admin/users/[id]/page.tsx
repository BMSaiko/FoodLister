'use client';

import { use } from 'react';
import { useAdminUserDetail } from '@/hooks/admin/useAdminUserDetail';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import Link from 'next/link';
import { ArrowLeft, Mail, MapPin, Globe, Calendar, Star, List, Shield, UserX } from 'lucide-react';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { useState } from 'react';

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = use(params);
  const { user, stats, recentReviews, recentLists, loading, error, refresh } = useAdminUserDetail(id);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  const handleDeactivate = async () => {
    try {
      const response = await fetch('/api/admin/users/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id }),
        credentials: 'include',
      });
      if (response.ok) {
        refresh();
      }
    } catch (err) {
      console.error('Error deactivating user:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-4 rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 text-red-400 text-sm">
        Erro: {error || 'Utilizador não encontrado'}
      </div>
    );
  }

  return (
    <ErrorBoundary pageName="UserDetail">
      <div className="space-y-6 max-w-5xl mx-auto" style={{ animation: 'fadeUp 600ms ease forwards' }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/users"
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar à lista
          </Link>
          <div className="flex items-center gap-2">
            {user.isActive !== false && (
              <button
                onClick={() => setShowDeactivateModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 ring-1 ring-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors duration-150"
              >
                <UserX className="h-4 w-4" />
                Desativar
              </button>
            )}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              user.isActive !== false
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${user.isActive !== false ? 'bg-emerald-400' : 'bg-red-400'}`} />
              {user.isActive !== false ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>

        {/* User Info Card */}
        <div className="relative p-1.5 rounded-[2rem]">
          <div className="absolute inset-0 rounded-[2rem] bg-white/[0.05] ring-1 ring-white/10 backdrop-blur-xl" />
          <div className="relative rounded-[calc(2rem-0.375rem)] p-8 bg-gradient-to-br from-[#0a0a0a] to-[#111111]">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                {(user.name || '?')[0].toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-white tracking-tight">{user.name || 'Anónimo'}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-white/40">
                  {user.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      {user.email}
                    </span>
                  )}
                  {user.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {user.location}
                    </span>
                  )}
                  {user.website && (
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white/60 transition-colors">
                      <Globe className="h-3.5 w-3.5" />
                      Website
                    </a>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Desde {new Date(user.createdAt).toLocaleDateString('pt-PT')}
                  </span>
                </div>
                {user.bio && (
                  <p className="mt-4 text-sm text-white/50 leading-relaxed">{user.bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative p-1.5 rounded-[1.5rem]">
            <div className="absolute inset-0 rounded-[1.5rem] bg-white/[0.05] ring-1 ring-white/10" />
            <div className="relative rounded-[calc(1.5rem-0.375rem)] p-5 bg-gradient-to-br from-[#0a0a0a] to-[#111111] text-center">
              <Star className="h-5 w-5 text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats?.totalReviews || 0}</p>
              <p className="text-xs text-white/30 mt-1">Reviews</p>
            </div>
          </div>
          <div className="relative p-1.5 rounded-[1.5rem]">
            <div className="absolute inset-0 rounded-[1.5rem] bg-white/[0.05] ring-1 ring-white/10" />
            <div className="relative rounded-[calc(1.5rem-0.375rem)] p-5 bg-gradient-to-br from-[#0a0a0a] to-[#111111] text-center">
              <List className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats?.totalLists || 0}</p>
              <p className="text-xs text-white/30 mt-1">Listas</p>
            </div>
          </div>
          <div className="relative p-1.5 rounded-[1.5rem]">
            <div className="absolute inset-0 rounded-[1.5rem] bg-white/[0.05] ring-1 ring-white/10" />
            <div className="relative rounded-[calc(1.5rem-0.375rem)] p-5 bg-gradient-to-br from-[#0a0a0a] to-[#111111] text-center">
              <Shield className="h-5 w-5 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats?.totalRestaurantsVisited || 0}</p>
              <p className="text-xs text-white/30 mt-1">Restaurantes</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Reviews */}
          <div className="relative p-1.5 rounded-[2rem]">
            <div className="absolute inset-0 rounded-[2rem] bg-white/[0.05] ring-1 ring-white/10" />
            <div className="relative rounded-[calc(2rem-0.375rem)] p-6 bg-gradient-to-br from-[#0a0a0a] to-[#111111]">
              <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-white/40 mb-4">Reviews Recentes</h3>
              {recentReviews.length === 0 ? (
                <p className="text-sm text-white/20">Sem reviews recentes</p>
              ) : (
                <div className="space-y-3">
                  {recentReviews.map((review: any) => (
                    <div key={review.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-amber-400">{review.rating}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/70 truncate">{review.comment || 'Sem comentário'}</p>
                        <p className="text-xs text-white/30">{new Date(review.created_at).toLocaleDateString('pt-PT')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Lists */}
          <div className="relative p-1.5 rounded-[2rem]">
            <div className="absolute inset-0 rounded-[2rem] bg-white/[0.05] ring-1 ring-white/10" />
            <div className="relative rounded-[calc(2rem-0.375rem)] p-6 bg-gradient-to-br from-[#0a0a0a] to-[#111111]">
              <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-white/40 mb-4">Listas Recentes</h3>
              {recentLists.length === 0 ? (
                <p className="text-sm text-white/20">Sem listas recentes</p>
              ) : (
                <div className="space-y-3">
                  {recentLists.map((list: any) => (
                    <div key={list.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <List className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/70 truncate">{list.name}</p>
                        <p className="text-xs text-white/30">
                          {list.is_public ? 'Pública' : 'Privada'} · {new Date(list.created_at).toLocaleDateString('pt-PT')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <ConfirmModal
          isOpen={showDeactivateModal}
          onClose={() => setShowDeactivateModal(false)}
          onConfirm={handleDeactivate}
          title="Desativar Utilizador"
          message={`Tens a certeza que desejas desativar ${user.name || 'este utilizador'}? A conta será desativada mas os dados mantidos na base de dados.`}
          confirmText="Desativar"
          danger
        />
      </div>
    </ErrorBoundary>
  );
}
