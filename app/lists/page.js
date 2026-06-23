'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ListCard from '@/components/ui/RestaurantManagement/ListCard';
import Navbar from '@/components/ui/navigation/Navbar';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Plus, Search as SearchIcon, ListChecks } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import Skeleton from '@/components/ui/Skeleton';

function ListsContent() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState([]);
  const [activeTag, setActiveTag] = useState(null);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    async function fetchLists() {
      setLoading(true);
      try {
        const param = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
        const res = await fetch(`/api/lists${param}`, { next: { revalidate: 60 } });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setLists(data.lists || []);

        // Extract unique tags
        const tags = new Set();
        (data.lists || []).forEach((list) => {
          (list.tags || []).forEach((tag) => tags.add(tag));
        });
        setAllTags(Array.from(tags));
      } catch (error) {
        console.error('Erro:', error);
        setLists([]);
      } finally {
        setLoading(false);
      }
    }
    fetchLists();
  }, [searchQuery]);

  const filteredLists = activeTag
    ? lists.filter((list) => (list.tags || []).includes(activeTag))
    : lists;

  return (
    <main className="min-min-h-[100dvh] bg-[var(--background)]">
      <Navbar />
      <Container className="py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] tracking-tighter">
              {searchQuery ? `Resultados para "${searchQuery}"` : 'As Tuas Listas'}
            </h1>
            <p className="text-[var(--foreground-secondary)] mt-2">
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

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <div className="mb-6 overflow-x-auto tag-filter-scroll pb-2 -mx-4 px-4">
            <div className="flex gap-2 min-w-max">
              <button
                onClick={() => setActiveTag(null)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !activeTag
                    ? 'bg-[var(--primary)] text-black'
                    : 'bg-white/[0.03] border border-white/[0.08] text-[var(--foreground-secondary)] hover:bg-white/[0.06]'
                }`}
              >
                Todas
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeTag === tag
                      ? 'bg-[var(--primary)] text-black'
                      : 'bg-white/[0.03] border border-white/[0.08] text-[var(--foreground-secondary)] hover:bg-white/[0.06]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <Skeleton variant="list-card" />
              </div>
            ))}
          </div>
        ) : filteredLists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                  restaurantCount={list.restaurantCount || list.restaurants?.length || 0}
                  isOwner={true}
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
          title="Criar lista"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </motion.div>
    </main>
  );
}

export default function ListsPage() {
  return (
    <Suspense fallback={<div className="min-min-h-[100dvh] bg-[var(--background)]" />}>
      <ListsContent />
    </Suspense>
  );
}
