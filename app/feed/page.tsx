"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/navigation/Navbar";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Activity, Loader2, ChevronDown, User } from "lucide-react";

// ponytail: fetch inline no page, sem hook separado. Padrão {data,total,page,limit,hasMore}.
interface FeedItem {
  id: string;
  type: "review" | "list" | "follow";
  actor: { name: string; avatar: string | null; user_id_code: string | null };
  text: string;
  link: string;
  createdAt: string;
}

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

export default function FeedPage() {
  usePageTitle("Feed");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (nextPage: number, append: boolean) => {
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
    }
  };

  // ponytail: sem estado extra refetch; recarrega a partir da page 1 só no mount
  useEffect(() => { load(1, false); }, []);

  return (
    <div className="min-h-[100dvh]" style={{ backgroundColor: "var(--background)" }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="h-6 w-6 text-[var(--primary)]" />
          <h1 className="text-2xl font-semibold text-[var(--gray-900)]">Feed</h1>
        </div>

        {error && (
          <p className="text-[var(--error)] text-sm mb-4">Erro ao carregar atividade: {error}</p>
        )}

        {loading && items.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-[var(--gray-500)] text-sm text-center py-12">Ainda sem atividade.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Link key={item.id} href={item.link} className="block">
                <div className="flex gap-3 p-3 bg-[var(--card-bg)] rounded-xl shadow-[var(--card-shadow)] hover:bg-white/[0.04] transition-colors">
                  {item.actor.user_id_code ? (
                    <Link href={`/users/${item.actor.user_id_code}`} onClick={(e) => e.stopPropagation()}>
                      {item.actor.avatar ? (
                        <img src={item.actor.avatar} alt={item.actor.name} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 bg-[var(--primary-light)] rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-[var(--primary-dark)]" />
                        </div>
                      )}
                    </Link>
                  ) : item.actor.avatar ? (
                    <img src={item.actor.avatar} alt={item.actor.name} className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 bg-[var(--primary-light)] rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-[var(--primary-dark)]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--gray-900)]">
                      <span className="font-medium">{item.actor.name}</span>{" "}
                      <span className="text-[var(--gray-600)]">{item.text}</span>
                    </p>
                    <span className="text-xs text-[var(--gray-400)]">{formatTimeAgo(item.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}

            {hasMore && (
              <button
                onClick={() => load(page + 1, true)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown className="h-4 w-4" />}
                Carregar mais
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
