'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useLanguage } from "@/contexts";
import { useSearchParams } from 'next/navigation';
import { useAuthUser } from '@/hooks/auth/useAuthUser';
import ListCard from '@/components/ui/RestaurantManagement/ListCard';
import Navbar from '@/components/ui/navigation/Navbar';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Plus, Search as SearchIcon, ListChecks, RefreshCw } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { usePageTitle } from "@/hooks/usePageTitle";

const likesOf = (l) => {
  const lc = l.like_count;
  return Array.isArray(lc) ? (lc[0]?.count ?? 0) : (typeof lc === 'object' && lc ? (lc.count ?? 0) : (typeof lc === 'number' ? lc : 0));
};
const countOf = (l) => l.restaurantCount || l.restaurants?.length || 0;

const SORTS = {
  recent: { label: 'Mais recentes', fn: (a, b) => String(b.created_at).localeCompare(String(a.created_at)) },
  likes: { label: 'Mais gostadas', fn: (a, b) => likesOf(b) - likesOf(a) },
  size: { label: 'Mais restaurantes', fn: (a, b) => countOf(b) - countOf(a) },
  name: { label: 'Nome A–Z', fn: (a, b) => a.name.localeCompare(b.name, 'pt') },
};

const chipCls = (on) =>
  `px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
    on
      ? 'bg-[var(--primary)] text-black'
      : 'bg-white/[0.03] border border-white/[0.08] text-[var(--foreground-secondary)] hover:bg-white/[0.06]'
  }`;

const sideBtnCls = (on) =>
  `flex w-full justify-between items-center min-h-10 px-3 rounded-[10px] text-sm text-left transition-colors ${
    on ? 'bg-[var(--primary)]/15 text-[var(--primary)] font-semibold' : 'text-[var(--foreground-secondary)] hover:bg-white/5'
  }`;

const toolCls =
  'w-full min-h-10 px-3 rounded-[10px] bg-white/[0.04] border border-white/[0.08] text-[var(--foreground)] text-sm';

function ListsContent() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { user } = useAuthUser();
  const { t } = useLanguage();
  const [activeTag, setActiveTag] = useState(null);
  const [sortKey, setSortKey] = useState('recent');
  const [tagQuery, setTagQuery] = useState('');
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');

  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const param = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
      const res = await fetch(`/api/lists${param}`, { next: { revalidate: 60 } });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setLists(data.lists || []);
    } catch (err) {
      console.error('Erro:', err);
      setLists([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // etiquetas únicas com contagem de listas
  const tagCounts = useMemo(() => {
    const counts = {};
    lists.forEach((l) => (l.tags || []).forEach((tag) => { counts[tag] = (counts[tag] || 0) + 1; }));
    return counts;
  }, [lists]);
  const allTags = Object.keys(tagCounts);
  const visibleTags = allTags.filter((tag) => tag.toLowerCase().includes(tagQuery.toLowerCase()));

  const filteredLists = useMemo(() => {
    const base = activeTag ? lists.filter((l) => (l.tags || []).includes(activeTag)) : lists;
    return base.slice().sort(SORTS[sortKey].fn);
  }, [lists, activeTag, sortKey]);

  const sortSelect = (
    <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} aria-label="Ordenar listas" className={toolCls}>
      {Object.entries(SORTS).map(([k, s]) => (
        <option key={k} value={k} className="bg-[#111]">{s.label}</option>
      ))}
    </select>
  );

  return (
    <main className="min-h-[100dvh] bg-[var(--background)]">
      <Navbar />
      <Container className="py-6 sm:py-8">
        <div className="grid gap-0 grid-cols-[minmax(0,1fr)] min-[900px]:grid-cols-[220px_minmax(0,1fr)] min-[900px]:gap-12">
          {/* Sidebar (desktop) */}
          {!error && (allTags.length > 0 || lists.length > 0) && (
            <aside aria-label="Etiquetas" className="hidden min-[900px]:block sticky top-28 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="grid gap-2 mb-3">
                {sortSelect}
                <input
                  type="search"
                  value={tagQuery}
                  onChange={(e) => setTagQuery(e.target.value)}
                  placeholder="Procurar etiqueta"
                  aria-label="Procurar etiqueta"
                  className={toolCls}
                />
              </div>
              <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--foreground-muted)]">Etiquetas</h3>
              <button type="button" aria-pressed={!activeTag} onClick={() => setActiveTag(null)} className={sideBtnCls(!activeTag)}>
                Todas <small className="font-mono text-[11px] opacity-70">{lists.length}</small>
              </button>
              {visibleTags.map((tag) => (
                <button key={tag} type="button" aria-pressed={activeTag === tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)} className={sideBtnCls(activeTag === tag)}>
                  #{tag} <small className="font-mono text-[11px] opacity-70">{tagCounts[tag]}</small>
                </button>
              ))}
            </aside>
          )}

          <section className="min-w-0 min-[900px]:col-start-2 min-[900px]:row-start-1">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--foreground)] tracking-tighter leading-tight">
                  {searchQuery ? `Resultados para "${searchQuery}"` : 'As Tuas Listas'}
                </h1>
                <p className="text-[var(--foreground-secondary)] mt-1.5">
                  {searchQuery
                    ? `${filteredLists.length} lista(s) encontrada(s)`
                    : 'Organiza os teus restaurantes em listas personalizadas'}
                </p>
              </div>
              <Link
                href="/lists/create"
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-black font-semibold rounded-full hover:bg-[var(--primary-hover)] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nova Lista
              </Link>
            </div>

            {/* Chips (mobile) */}
            {!error && allTags.length > 0 && (
              <div className="min-[900px]:hidden mb-5 grid gap-3">
                <div className="overflow-x-auto tag-filter-scroll pb-2 -mx-4 px-4" role="group" aria-label="Filtrar por etiqueta">
                  <div className="flex gap-2 min-w-max">
                    <button type="button" aria-pressed={!activeTag} onClick={() => setActiveTag(null)} className={chipCls(!activeTag)}>
                      Todas <small className="font-mono text-[11px] opacity-70">{lists.length}</small>
                    </button>
                    {allTags.map((tag) => (
                      <button key={tag} type="button" aria-pressed={activeTag === tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)} className={chipCls(activeTag === tag)}>
                        #{tag} <small className="font-mono text-[11px] opacity-70">{tagCounts[tag]}</small>
                      </button>
                    ))}
                  </div>
                </div>
                {sortSelect}
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 min-[900px]:gap-x-6 min-[900px]:gap-y-7" aria-busy="true">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="grid gap-3.5 animate-pulse">
                    <div className="aspect-[16/10] rounded-2xl bg-white/[0.06]" />
                    <div className="h-3.5 w-[30%] rounded bg-white/[0.06]" />
                    <div className="h-5 w-3/4 rounded bg-white/[0.06]" />
                    <div className="h-3 w-[55%] rounded bg-white/[0.06]" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20" role="alert">
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">Não foi possível carregar as listas</h2>
                <p className="text-[var(--foreground-secondary)] mb-6 max-w-md mx-auto">Verifica a ligação e tenta de novo.</p>
                <button
                  type="button"
                  onClick={fetchLists}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-black font-semibold rounded-full hover:bg-[var(--primary-hover)] transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Tentar de novo
                </button>
              </div>
            ) : filteredLists.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 min-[900px]:gap-x-6 min-[900px]:gap-y-7">
                {filteredLists.map((list, index) => (
                  <motion.div
                    key={list.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.5, delay: (index % 6) * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ListCard
                      list={list}
                      restaurantCount={countOf(list)}
                      isOwner={list.userRole === 'owner' || list.creator_id === user?.id}
                      onDelete={(id) => setLists((prev) => prev.filter((l) => l.id !== id))}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6 empty-state-icon">
                  {searchQuery ? (
                    <SearchIcon className="w-8 h-8 text-amber-400" />
                  ) : (
                    <ListChecks className="w-8 h-8 text-amber-400" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">
                  {searchQuery ? 'Sem resultados' : 'Nenhuma lista criada'}
                </h2>
                <p className="text-[var(--foreground-secondary)] mb-6 max-w-md mx-auto">
                  {searchQuery
                    ? `Não encontramos listas que correspondam a "${searchQuery}".`
                    : 'Cria a tua primeira lista para organizar os teus restaurantes favoritos.'}
                </p>
                {searchQuery ? (
                  <Link href="/lists" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/[0.03] border border-white/[0.08] text-[var(--foreground)] font-medium rounded-full hover:bg-white/[0.06] transition-colors">
                    Limpar pesquisa
                  </Link>
                ) : (
                  <Link href="/lists/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-black font-semibold rounded-full hover:bg-[var(--primary-hover)] transition-colors">
                    <Plus className="w-4 h-4" />
                    Criar Nova Lista
                  </Link>
                )}
              </div>
            )}
          </section>
        </div>
      </Container>

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40"
      >
        <Link
          href="/lists/create"
          className="w-14 h-14 rounded-full bg-[var(--primary)] text-black flex items-center justify-center shadow-lg hover:bg-[var(--primary-hover)] transition-colors fab-pulse"
          title={t('Criar lista')}
        >
          <Plus className="w-6 h-6" />
        </Link>
      </motion.div>
    </main>
  );
}

export default function ListsPage() {
  usePageTitle("Listas - FoodLister");
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[var(--background)]" />}>
      <ListsContent />
    </Suspense>
  );
}
