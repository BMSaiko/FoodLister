'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMarketing } from '@/hooks/marketing/useMarketing';
import { useRestaurants } from '@/hooks/data/useRestaurants';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { Megaphone, Plus, ArrowLeft, Sparkles, Send, CalendarDays, List } from 'lucide-react';
import { toast } from 'react-toastify';
import type { SocialPlatform, PostType } from '@/libs/types';
import { usePageTitle } from "@/hooks/usePageTitle";

const PLATFORMS: SocialPlatform[] = ['twitter', 'instagram', 'facebook', 'linkedin', 'tiktok', 'youtube'];
const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  twitter: 'X / Twitter',
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  youtube: 'YouTube',
};

const POST_TYPES: PostType[] = ['restaurant_promo', 'list_digest', 'review_highlight', 'general'];
const POST_TYPE_LABEL: Record<PostType, string> = {
  restaurant_promo: 'Promo Restaurante',
  list_digest: 'Resumo de Lista',
  review_highlight: 'Destaque de Review',
  general: 'Geral',
};

const POST_STATUS_LABEL: Record<string, string> = {
  draft: 'Rascunho',
  scheduled: 'Agendado',
  publishing: 'A publicar',
  published: 'Publicado',
  failed: 'Falhou',
};

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface PostRow {
  id: string;
  content: string;
  platform: string;
  post_type?: string;
  postType?: string;
  status?: string;
  ai_generated?: boolean;
  aiGenerated?: boolean;
  created_at?: string;
  createdAt?: string;
  scheduled_for?: string | null;
  scheduledFor?: string | null;
}

const EMPTY = {
  campaignId: '',
  restaurantId: '',
  platform: 'instagram' as SocialPlatform,
  postType: 'restaurant_promo' as PostType,
  content: '',
  scheduledFor: '',
};

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function AdminPostsPage() {
  usePageTitle("Admin · Posts - FoodLister");
  const { posts, campaigns, loading, fetchPosts, fetchCampaigns, createPost } = useMarketing();
  const { restaurants } = useRestaurants(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [cursor, setCursor] = useState(() => new Date());

  useEffect(() => {
    fetchPosts();
    fetchCampaigns();
  }, [fetchPosts, fetchCampaigns]);

  const rows = posts as unknown as PostRow[];

  const openCreate = () => setModal(true);
  const close = () => {
    setModal(false);
    setForm(EMPTY);
  };

  const generate = async () => {
    if (!form.restaurantId) {
      toast.error('Seleciona um restaurante para gerar conteúdo com IA');
      return;
    }
    setGenerating(true);
    const created = await createPost({
      platform: form.platform,
      postType: form.postType,
      restaurantId: form.restaurantId,
      aiGenerate: true,
    });
    setGenerating(false);
    if (created) {
      close();
      fetchPosts();
    }
  };

  const save = async () => {
    if (!form.content.trim()) {
      toast.error('Escreve o conteúdo ou gera com IA');
      return;
    }
    setSaving(true);
    const created = await createPost({
      platform: form.platform,
      postType: form.postType,
      restaurantId: form.restaurantId || undefined,
      campaignId: form.campaignId || undefined,
      content: form.content.trim(),
      scheduledFor: form.scheduledFor || undefined,
    });
    setSaving(false);
    if (created) {
      close();
      fetchPosts();
    }
  };

  // calendar grid (ponytail: native Date, no calendar lib)
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const postsByDay = new Map<string, PostRow[]>();
  for (const p of rows) {
    const s = p.scheduled_for ?? p.scheduledFor;
    if (!s) continue;
    const key = ymd(new Date(s));
    if (!postsByDay.has(key)) postsByDay.set(key, []);
    postsByDay.get(key)!.push(p);
  }

  const monthLabel = cursor.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });

  return (
    <ErrorBoundary pageName="Posts">
      <div className="space-y-8 max-w-7xl mx-auto" style={{ animation: 'fadeUp 600ms ease forwards' }}>
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin/marketing" className="flex items-center gap-1 text-xs text-white/40 hover:text-amber-400 transition-colors mb-2">
              <ArrowLeft className="h-3 w-3" /> Marketing
            </Link>
            <h1 className="text-3xl font-bold text-white tracking-tight">Posts</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-full bg-white/5 ring-1 ring-white/10">
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${view === 'list' ? 'bg-amber-500/20 text-amber-300' : 'text-white/50 hover:text-white'}`}
              >
                <List className="h-3.5 w-3.5" /> Lista
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-amber-500/20 text-amber-300' : 'text-white/50 hover:text-white'}`}
              >
                <CalendarDays className="h-3.5 w-3.5" /> Calendário
              </button>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-500/10 ring-1 ring-amber-500/20 text-amber-300 text-sm font-medium hover:bg-amber-500/20 transition-colors duration-150"
            >
              <Plus className="h-4 w-4" /> Novo Post
            </button>
          </div>
        </div>

        {loading && posts.length === 0 ? (
          <p className="text-white/30 text-sm">A carregar...</p>
        ) : view === 'calendar' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white capitalize">{monthLabel}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCursor(new Date(year, month - 1, 1))}
                  className="px-3 py-1.5 rounded-full bg-white/5 ring-1 ring-white/10 text-white/70 text-sm hover:bg-white/10 transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={() => setCursor(new Date())}
                  className="px-3 py-1.5 rounded-full bg-white/5 ring-1 ring-white/10 text-white/70 text-sm hover:bg-white/10 transition-colors"
                >
                  Hoje
                </button>
                <button
                  onClick={() => setCursor(new Date(year, month + 1, 1))}
                  className="px-3 py-1.5 rounded-full bg-white/5 ring-1 ring-white/10 text-white/70 text-sm hover:bg-white/10 transition-colors"
                >
                  →
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {WEEKDAYS.map((w) => (
                <div key={w} className="text-xs text-white/30 uppercase tracking-[0.1em] py-1">{w}</div>
              ))}
              {cells.map((d, i) => {
                if (!d) return <div key={`e${i}`} />;
                const key = ymd(d);
                const dayPosts = postsByDay.get(key) ?? [];
                const isToday = key === ymd(new Date());
                return (
                  <div
                    key={key}
                    className={`min-h-[96px] rounded-xl p-1.5 text-left bg-white/[0.02] ring-1 ${isToday ? 'ring-amber-500/40' : 'ring-white/10'}`}
                  >
                    <div className={`text-xs mb-1 ${isToday ? 'text-amber-300 font-semibold' : 'text-white/40'}`}>{d.getDate()}</div>
                    <div className="space-y-1">
                      {dayPosts.map((p) => (
                        <div
                          key={p.id}
                          title={p.content}
                          className="truncate rounded-md bg-amber-500/10 ring-1 ring-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-200"
                        >
                          {PLATFORM_LABEL[(p.platform as SocialPlatform)] ?? p.platform}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {rows.filter((p) => !(p.scheduled_for ?? p.scheduledFor)).length > 0 && (
              <p className="text-xs text-white/30">Posts sem data agendada aparecem apenas na vista Lista.</p>
            )}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-white/30 text-sm">Sem posts ainda.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rows.map((p) => (
              <div key={p.id} className="group relative p-1.5 rounded-[2rem] transition-colors duration-150 hover:bg-white/[0.06]">
                <div className="absolute inset-0 rounded-[2rem] bg-white/[0.05] ring-1 ring-white/10 backdrop-blur-xl" />
                <div className="relative rounded-[calc(2rem-0.375rem)] p-6 bg-gradient-to-br from-[#0a0a0a] to-[#111111] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center ring-1 ring-white/10">
                        <Megaphone className="h-4 w-4 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/80">{PLATFORM_LABEL[(p.platform as SocialPlatform)] ?? p.platform}</p>
                        <p className="text-xs text-white/40 uppercase tracking-[0.15em]">
                          {POST_TYPE_LABEL[(p.post_type ?? p.postType) as PostType] ?? (p.post_type ?? p.postType) ?? '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.ai_generated && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 ring-1 ring-amber-500/20 text-amber-300 text-[10px] font-medium">
                          IA
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-white/5 ring-1 ring-white/10 text-white/50 text-[10px]">
                        {POST_STATUS_LABEL[(p.status as string)] ?? p.status ?? '—'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-white/60 line-clamp-4 whitespace-pre-wrap">{p.content}</p>
                  {p.scheduled_for && (
                    <p className="text-xs text-white/30 mt-3">Agendado: {new Date(p.scheduled_for).toLocaleString('pt-PT')}</p>
                  )}
                  {!p.scheduled_for && p.created_at && (
                    <p className="text-xs text-white/30 mt-3">{new Date(p.created_at).toLocaleDateString('pt-PT')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {modal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={close}
          >
            <div
              className="w-full max-w-lg rounded-2xl bg-[#0a0a0a] ring-1 ring-white/10 p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white">Novo Post</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <select
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value as SocialPlatform })}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 ring-1 ring-white/10 text-white text-sm outline-none focus:ring-amber-500/40"
                  >
                    {PLATFORMS.map((s) => (
                      <option key={s} value={s} className="bg-[#0a0a0a]">{PLATFORM_LABEL[s]}</option>
                    ))}
                  </select>
                  <select
                    value={form.postType}
                    onChange={(e) => setForm({ ...form, postType: e.target.value as PostType })}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 ring-1 ring-white/10 text-white text-sm outline-none focus:ring-amber-500/40"
                  >
                    {POST_TYPES.map((s) => (
                      <option key={s} value={s} className="bg-[#0a0a0a]">{POST_TYPE_LABEL[s]}</option>
                    ))}
                  </select>
                </div>

                <select
                  value={form.restaurantId}
                  onChange={(e) => setForm({ ...form, restaurantId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 ring-1 ring-white/10 text-white text-sm outline-none focus:ring-amber-500/40"
                >
                  <option value="" className="bg-[#0a0a0a]">Restaurante (p/ IA)</option>
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id} className="bg-[#0a0a0a]">{r.name}</option>
                  ))}
                </select>

                <select
                  value={form.campaignId}
                  onChange={(e) => setForm({ ...form, campaignId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 ring-1 ring-white/10 text-white text-sm outline-none focus:ring-amber-500/40"
                >
                  <option value="" className="bg-[#0a0a0a]">Campanha (opcional)</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#0a0a0a]">{c.name}</option>
                  ))}
                </select>

                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Conteúdo do post..."
                  rows={5}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 ring-1 ring-white/10 text-white text-sm placeholder:text-white/30 outline-none focus:ring-amber-500/40 resize-none"
                />

                <input
                  value={form.scheduledFor}
                  onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })}
                  placeholder="Agendar para (opcional, datetime)"
                  type="datetime-local"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 ring-1 ring-white/10 text-white text-sm placeholder:text-white/30 outline-none focus:ring-amber-500/40"
                />
              </div>

              <div className="flex justify-between gap-2 pt-2">
                <button
                  onClick={generate}
                  disabled={generating || saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 ring-1 ring-amber-500/30 text-amber-300 text-sm font-medium hover:bg-amber-500/30 disabled:opacity-40 transition-colors"
                >
                  <Sparkles className="h-4 w-4" /> {generating ? 'A gerar...' : 'Gerar com IA'}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={close}
                    className="px-4 py-2 rounded-lg text-white/60 text-sm hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={save}
                    disabled={saving || generating}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 ring-1 ring-amber-500/30 text-amber-300 text-sm font-medium hover:bg-amber-500/30 disabled:opacity-40 transition-colors"
                  >
                    <Send className="h-4 w-4" /> {saving ? 'A criar...' : 'Criar Post'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
