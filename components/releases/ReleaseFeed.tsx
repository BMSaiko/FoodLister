'use client';

import React, { useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';
import type { ReleaseCategory, ReleaseNote } from '@/libs/releases/types';
import ReleaseCard from './ReleaseCard';
import { CATEGORIES } from './helpers';

const FILTERS: { key: ReleaseCategory | null; label: string }[] = [{ key: null, label: 'Tudo' }, ...CATEGORIES];

interface Props {
  releases: ReleaseNote[];
  hasMore?: boolean;
}

export default function ReleaseFeed({ releases: initial, hasMore: initialHasMore = false }: Props) {
  const [releases, setReleases] = useState(initial);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<ReleaseCategory | null>(null);

  if (releases.length === 0) {
    return (
      <EmptyState
        mascot="a-dormir"
        title="Ainda não há novidades"
        description="Quando houver uma nova versão, aparece aqui."
      />
    );
  }

  const visible = filter ? releases.filter((r) => r.items[filter].length > 0) : releases;

  async function loadMore() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/releases?page=${page + 1}`);
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { releases: ReleaseNote[]; hasMore: boolean };
      setReleases((prev) => [...prev, ...data.releases]);
      setHasMore(data.hasMore);
      setPage((p) => p + 1);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div role="group" aria-label="Filtrar por categoria" className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map(({ key, label }) => (
          <button
            key={label}
            type="button"
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
            className={`min-h-[44px] rounded-full border px-4 text-sm font-medium transition-colors ${
              filter === key
                ? 'border-[var(--primary,#2563eb)] bg-[var(--primary,#2563eb)] text-white'
                : 'border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="space-y-6">
        {visible.map((note) => (
          <ReleaseCard key={note.version} note={note} latest={note.version === releases[0].version} filter={filter} />
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-4 text-sm text-[var(--gray-500)]">
          Não foi possível carregar mais. Tenta outra vez.
        </p>
      )}
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="min-h-[44px] rounded-full border border-[var(--card-border)] px-6 text-sm font-medium text-[var(--foreground)] disabled:opacity-60"
          >
            {loading ? 'A carregar…' : 'Carregar mais'}
          </button>
        </div>
      )}
    </div>
  );
}
