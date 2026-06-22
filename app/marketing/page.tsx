'use client';

import React, { useState } from 'react';
import { Plus, Megaphone, Share2, Zap, Calendar, TrendingUp } from 'lucide-react';
import Navbar from '@/components/ui/navigation/Navbar';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { useMarketing } from '@/hooks/marketing/useMarketing';
import { useSubscription } from '@/hooks/subscription/useSubscription';
import FeatureGate from '@/components/subscription/FeatureGate';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

type Tab = 'campaigns' | 'posts' | 'workflows';

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('campaigns');
  const { campaigns, posts, workflows, loading, createCampaign, createPost, createWorkflow } = useMarketing();
  const { createCheckout, plans } = useSubscription();

  const handleUpgrade = async () => {
    const premiumPlan = plans.find(p => p.name.toLowerCase().includes('premium'));
    if (premiumPlan) {
      const url = await createCheckout(premiumPlan.id, 'monthly');
      if (url) window.location.href = url;
    }
  };

  return (
    <FeatureGate feature="marketing_dashboard" currentTier="free" fallback={
      <div className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <Container variant="narrow" className="py-16">
          <div className="p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06] text-center max-w-md mx-auto">
            <Zap className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Marketing AI</h1>
            <p className="text-foreground-secondary mb-6">
              Cria conteúdo para redes sociais com IA, gere campanhas e automatize a tua presença digital.
            </p>
            <button onClick={handleUpgrade} className="btn bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Upgrade para Premium
            </button>
          </div>
        </Container>
      </div>
    }>
      <div className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <Container variant="wide" className="py-6">
          <PageHeader
            title="Marketing AI"
            subtitle="Cria conteúdo para redes sociaux com IA"
            action={
              <button className="btn bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all btn-sm">
                <Plus className="h-4 w-4" />
                Nova Campanha
              </button>
            }
          />

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { id: 'campaigns' as Tab, label: 'Campanhas', icon: Megaphone },
              { id: 'posts' as Tab, label: 'Posts', icon: Share2 },
              { id: 'workflows' as Tab, label: 'Workflows', icon: Zap },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-[var(--radius-lg)] text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.08]'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : activeTab === 'campaigns' ? (
            campaigns.length === 0 ? (
              <EmptyState
                icon={Megaphone}
                title="Sem campanhas"
                description="Cria a tua primeira campanha de marketing"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{campaign.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        campaign.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                        campaign.status === 'draft' ? 'bg-white/[0.04] text-white/40' :
                        campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    {campaign.description && (
                      <p className="text-sm text-foreground-secondary mb-3">{campaign.description}</p>
                    )}
                    {campaign.targetPlatforms && campaign.targetPlatforms.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {campaign.targetPlatforms.map((p) => (
                          <span key={p} className="text-xs bg-primary-lighter text-purple-400-dark px-2 py-0.5 rounded">
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : activeTab === 'posts' ? (
            posts.length === 0 ? (
              <EmptyState
                icon={Share2}
                title="Sem posts"
                description="Cria o teu primeiro post para redes sociais"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.map((post) => (
                  <div key={post.id} className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-purple-400">{post.platform}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        post.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' :
                        post.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                        post.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-white/[0.04] text-white/40'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    <p className="text-sm text-foreground-secondary line-clamp-3 mb-3">{post.content}</p>
                    {post.aiGenerated && (
                      <span className="text-xs bg-primary-lighter text-purple-400-dark px-2 py-0.5 rounded">
                        ✨ AI Generated
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            workflows.length === 0 ? (
              <EmptyState
                icon={Zap}
                title="Sem workflows"
                description="Cria workflows automáticos de conteúdo com IA"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workflows.map((wf) => (
                  <div key={wf.id} className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{wf.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        wf.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.04] text-white/40'
                      }`}>
                        {wf.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-xs text-foreground-secondary">Trigger: {wf.triggerType}</p>
                    <p className="text-xs text-foreground-secondary">Platform: {wf.platform}</p>
                  </div>
                ))}
              </div>
            )
          )}
        </Container>
      </div>
    </FeatureGate>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="card p-12 text-center">
      <Icon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-foreground-secondary">{description}</p>
    </div>
  );
}
