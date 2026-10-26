"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/navigation/Navbar";
import EmptyState from "@/components/ui/EmptyState";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useInfiniteScroll } from "@/hooks/ui/useInfiniteScroll";
import ToviLoader from "@/components/loading/ToviLoader";
import Icon from "@/components/ui/icons/Icon";

interface FeedItem {
  id: string;
  type: "review" | "list" | "follow";
  actor: { name: string; avatar: string | null; user_id_code: string | null };
  text: string;
  link: string;
  images: string[];
  createdAt: string;
}

const TYPE_META = {
  review: { label: "Review", icon: "estrela" },
  list: { label: "Nova lista", icon: "lista-mais" },
  follow: { label: "Novo seguidor", icon: "utilizador-mais" },
} as const;

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMins < 1) return "Agora mesmo";
  if (diffMins < 60) return `há ${diffMins}min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `há ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `há ${diffDays}d`;
  return date.toLocaleDateString("pt-PT");
}

function Avatar({ actor }: { actor: FeedItem["actor"] }) {
  const inner = actor.avatar ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={actor.avatar} alt={actor.name} className="h-full w-full object-cover" />
  ) : (
    <Icon name="perfil" className="h-[18px] w-[18px] text-[var(--primary-dark)]" />
  );
  const cls = "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--primary-light)]";
  // Link irmão do link esticado do cartão (sem <a> dentro de <a>)
  return actor.user_id_code ? (
    <Link href={`/users/${actor.user_id_code}`} aria-label={`Perfil de ${actor.name}`} className={`${cls} hover:ring-2 hover:ring-[var(--primary)]`}>
      {inner}
    </Link>
  ) : (
    <span className={cls}>{inner}</span>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  const meta = TYPE_META[item.type];
  return (
    <article className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[var(--card-bg)] shadow-[var(--card-shadow)] transition-colors hover:border-[var(--primary)]/40">
      <header className="flex items-start gap-3 px-4 py-3.5">
        <Avatar actor={item.actor} />
        <div className="min-w-0 flex-1 break-words">
          <p className="text-[15px] text-[var(--gray-600)]">
            <span className="font-semibold text-[var(--gray-900)]">{item.actor.name}</span>{" "}
            {item.text}
          </p>
          <time dateTime={item.createdAt} className="text-xs text-[var(--gray-400)]">{formatTimeAgo(item.createdAt)}</time>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 pt-0.5 text-[11px] font-medium uppercase tracking-wider text-[var(--primary)]">
          <Icon name={meta.icon} className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{meta.label}</span>
        </span>
      </header>

      {item.type === "review" && item.images[0] && (
        <div className="px-4 pb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.images[0]} alt="" loading="lazy" className="h-40 w-full rounded-xl object-cover sm:h-44" />
        </div>
      )}
      {item.type === "list" && (
        <div className="px-4 pb-4">
          {item.images.length > 0 ? (
            <div className="grid grid-cols-3 gap-1.5">
              {item.images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="" loading="lazy" className="h-20 w-full rounded-[10px] object-cover sm:h-24" />
              ))}
            </div>
          ) : (
            <div className="flex h-14 items-center justify-center rounded-[10px] border border-dashed border-white/[0.08] text-[var(--gray-400)]">
              <Icon name="lista" className="h-5 w-5" />
            </div>
          )}
        </div>
      )}

      <Link href={item.link} aria-label={`${item.actor.name}: abrir ${meta.label.toLowerCase()}`} className="absolute inset-0 z-[1] rounded-2xl" />
    </article>
  );
}

function CardSkeleton({ media }: { media?: boolean }) {
  return (
    <div className="animate-pulse rounded-2xl border border-white/[0.08] bg-[var(--card-bg)] px-4 py-3.5" aria-hidden="true">
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-full bg-white/[0.06]" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 rounded bg-white/[0.06]" />
          <div className="h-3 w-2/5 rounded bg-white/[0.06]" />
        </div>
      </div>
      {media && <div className="mt-3 h-40 rounded-xl bg-white/[0.05]" />}
    </div>
  );
}

export default function FeedPage() {
  usePageTitle("Feed");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (nextPage: number, append: boolean) => {
    if (append) setLoadingMore(true);
    setError(null);
    try {
      const res = await fetch(`/api/feed?page=${nextPage}&limit=15`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      setItems((prev) => (append ? [...prev, ...data.data] : data.data));
      setHasMore(!!data.hasMore);
      setPage(nextPage);
    } catch (e: any) {
      setError(e.message || "Erro ao carregar feed");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { load(1, false); }, [load]);

  // Scroll infinito como /restaurants: sentinela 600px antes do fim. Com erro pára (não repete em ciclo); «Tentar novamente» retoma.
  const onLoadMore = useCallback(() => { load(page + 1, true); }, [load, page]);
  const sentinelRef = useInfiniteScroll({
    hasMore: hasMore && !error,
    loading,
    loadingMore,
    onLoadMore,
    threshold: 600,
  });

  const fatal = !!error && items.length === 0;

  return (
    <div className="min-h-[100dvh]" style={{ backgroundColor: "var(--background)" }}>
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center gap-2.5">
          <Icon name="atividade" className="h-6 w-6 text-[var(--primary)]" />
          <div>
            <h1 className="text-2xl font-semibold text-[var(--gray-900)]">Feed</h1>
            <p className="text-sm text-[var(--gray-500)]">O que anda a acontecer à tua volta</p>
          </div>
        </div>

        {fatal ? (
          <EmptyState
            mascot="triste"
            title="Não conseguimos carregar o feed"
            description={`Erro ao carregar atividade: ${error}`}
            action={<button onClick={() => load(1, false)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-hover)]">Tentar novamente</button>}
          />
        ) : loading && items.length === 0 ? (
          <div className="flex items-center justify-center py-12" role="status" aria-label="A carregar">
            <ToviLoader size="sm" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            mascot="a-dormir"
            title="Ainda sem atividade"
            description="Segue amigos e restaurantes para ver aqui as novidades."
            action={<Link href="/restaurants" className="inline-flex items-center justify-center gap-2 px-5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors">Explorar restaurantes</Link>}
          />
        ) : (
          <>
            <div className="grid gap-3.5">
              {items.map((item) => (
                <FeedCard key={item.id} item={item} />
              ))}
            </div>

            {hasMore && <div ref={sentinelRef} aria-hidden="true" className="h-2" />}

            {loadingMore && (
              <div className="mt-3.5 grid gap-3.5">
                <CardSkeleton />
                <CardSkeleton media />
              </div>
            )}

            {error && (
              <div role="alert" className="mt-4 rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/10 p-3 text-center text-sm text-[var(--error)]">
                Erro ao carregar atividade: {error}
                <button onClick={onLoadMore} className="mt-2 flex min-h-[44px] w-full items-center justify-center rounded-xl border border-white/[0.08] text-[var(--primary)] hover:border-[var(--primary)]/50">
                  Tentar novamente
                </button>
              </div>
            )}

            {!hasMore && !error && (
              <p className="py-7 text-center text-[13px] text-[var(--gray-400)]">
                Chegaste ao fim. Segue mais gente para ver mais atividade.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
