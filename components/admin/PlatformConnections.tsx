'use client';

import { Loader2 } from 'lucide-react';

// ponytail: supported platforms per social_media_posts.platform CHECK. No OAuth exists,
// so "connected" = admin has >=1 post targeting the platform (data-driven, no dead UI).
const PLATFORMS: { id: string; label: string }[] = [
  { id: 'twitter', label: 'Twitter / X' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
];

export default function PlatformConnections({
  data,
  loading,
}: {
  data: { posts: { byPlatform: Record<string, number> } } | null;
  loading: boolean;
}) {
  return (
    <div
      className="group relative p-1.5 rounded-[2rem]"
      style={{ animation: 'fadeUp 800ms ease forwards', opacity: 0, animationDelay: '500ms' }}
    >
      <div className="absolute inset-0 rounded-[2rem] bg-white/[0.05] ring-1 ring-white/10 backdrop-blur-xl" />
      <div className="relative rounded-[calc(2rem-0.375rem)] p-6 bg-gradient-to-br from-[#0a0a0a] to-[#111111] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
        <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-white/40 mb-6">
          Plataformas Ligadas
        </h3>
        {loading && !data ? (
          <Loader2 className="w-5 h-5 animate-spin text-white/40" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PLATFORMS.map((p) => {
              const connected = (data?.posts.byPlatform?.[p.id] ?? 0) > 0;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] ring-1 ring-white/5"
                >
                  <span className="text-sm font-medium text-white">{p.label}</span>
                  <span
                    className={`flex items-center gap-1.5 text-xs font-medium ${
                      connected ? 'text-emerald-400' : 'text-white/30'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-white/20'}`}
                    />
                    {connected ? 'Ativo' : 'Por configurar'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
