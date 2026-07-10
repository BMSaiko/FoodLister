'use client';

import { useMarketingAnalytics } from '@/hooks/admin/useMarketingAnalytics';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import StatsCard from '@/components/admin/StatsCard';
import Link from 'next/link';
import { Megaphone, Send, CheckCircle2, Heart, RefreshCw } from 'lucide-react';

export default function AdminMarketingPage() {
  const { data, loading, error, refresh } = useMarketingAnalytics();

  return (
    <ErrorBoundary pageName="Marketing">
      <div className="space-y-8 max-w-7xl mx-auto" style={{ animation: 'fadeUp 600ms ease forwards' }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-400/60 mb-2">Marketing AI</p>
            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard de Marketing</h1>
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

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/marketing/campaigns"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 ring-1 ring-white/10 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors duration-150"
          >
            <Megaphone className="h-4 w-4" /> Gerir Campanhas
          </Link>
          <Link
            href="/admin/marketing/posts"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 ring-1 ring-white/10 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors duration-150"
          >
            <Send className="h-4 w-4" /> Gerir Posts
          </Link>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Campanhas"
            value={data?.campaigns.total ?? 0}
            icon={Megaphone}
            subtitle={data ? `${Object.keys(data.campaigns.byStatus).length} estados` : undefined}
            delay={0}
          />
          <StatsCard
            title="Posts"
            value={data?.posts.total ?? 0}
            icon={Send}
            subtitle={data ? `${data.posts.published} publicados` : undefined}
            delay={100}
          />
          <StatsCard
            title="Publicados"
            value={data?.posts.published ?? 0}
            icon={CheckCircle2}
            subtitle="posts ativos"
            delay={200}
          />
          <StatsCard
            title="Engagement (likes)"
            value={data?.engagement.total.likes ?? 0}
            icon={Heart}
            subtitle={data ? `${data.engagement.total.shares} partilhas · ${data.engagement.total.comments} comentários` : undefined}
            delay={300}
          />
        </div>

        {/* Engagement by platform */}
        <div className="group relative p-1.5 rounded-[2rem]" style={{ animation: 'fadeUp 800ms ease forwards', opacity: 0, animationDelay: '400ms' }}>
          <div className="absolute inset-0 rounded-[2rem] bg-white/[0.05] ring-1 ring-white/10 backdrop-blur-xl" />
          <div className="relative rounded-[calc(2rem-0.375rem)] p-6 bg-gradient-to-br from-[#0a0a0a] to-[#111111] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
            <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-white/40 mb-6">Engagement por Plataforma</h3>
            {!data || Object.keys(data.engagement.byPlatform).length === 0 ? (
              <p className="text-sm text-white/30">Sem dados de engagement publicado ainda.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(data.engagement.byPlatform).map(([platform, e]) => (
                  <div
                    key={platform}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] ring-1 ring-white/5"
                  >
                    <p className="text-sm font-medium text-white capitalize">{platform}</p>
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      <span>♥ {e.likes}</span>
                      <span>↗ {e.shares}</span>
                      <span>💬 {e.comments}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
