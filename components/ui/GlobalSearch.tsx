'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getClient } from '@/libs/supabase/client';

interface SearchResult {
  id: string;
  type: 'restaurant' | 'list' | 'user';
  title: string;
  subtitle?: string;
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search
  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const supabase = getClient();
      const [restaurants, lists] = await Promise.all([
        supabase.from('restaurants')
          .select('id, name, location')
          .ilike('name', `%${q}%`)
          .limit(5),
        supabase.from('lists')
          .select('id, name, description')
          .ilike('name', `%${q}%`)
          .eq('is_public', true)
          .limit(5),
      ]);

      const combined: SearchResult[] = [
        ...((restaurants.data || []) as Array<{ id: string; name: string; location?: string }>).map(r => ({
          id: r.id,
          type: 'restaurant' as const,
          title: r.name,
          subtitle: r.location || undefined,
        })),
        ...((lists.data || []) as Array<{ id: string; name: string; description?: string }>).map(l => ({
          id: l.id,
          type: 'list' as const,
          title: l.name,
          subtitle: l.description || undefined,
        })),
      ];
      setResults(combined);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    if (result.type === 'restaurant') {
      router.push(`/restaurants/${result.id}`);
    } else if (result.type === 'list') {
      router.push(`/lists/${result.id}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => { setIsOpen(false); setQuery(''); }}
      />
      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-[var(--card-bg)] rounded-2xl shadow-2xl border border-[var(--gray-200)] overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--gray-200)]">
          {loading ? (
            <Loader2 className="h-5 w-5 text-[var(--primary)] animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-[var(--foreground-muted)]" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar restaurantes, listas..."
            className="flex-1 bg-transparent text-[var(--foreground)] placeholder-[var(--foreground-muted)] outline-none text-sm"
            aria-label="Pesquisa global"
          />
          <button
            onClick={() => { setIsOpen(false); setQuery(''); }}
            className="p-1 rounded-md hover:bg-[var(--background-secondary)] transition-colors"
            aria-label="Fechar pesquisa"
          >
            <X className="h-4 w-4 text-[var(--foreground-muted)]" />
          </button>
        </div>
        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {results.length === 0 && query.trim() && !loading && (
            <div className="px-4 py-8 text-center text-sm text-[var(--foreground-muted)]">
              Sem resultados para &quot;{query}&quot;
            </div>
          )}
          {results.length === 0 && !query.trim() && (
            <div className="px-4 py-8 text-center text-sm text-[var(--foreground-muted)]">
              Escreva para pesquisar restaurantes e listas públicas
            </div>
          )}
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelect(result)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--background-secondary)] transition-colors text-left"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                result.type === 'restaurant' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
              }`}>
                <Search className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">{result.title}</p>
                {result.subtitle && (
                  <p className="text-xs text-[var(--foreground-muted)] truncate">{result.subtitle}</p>
                )}
              </div>
              <span className="text-xs text-[var(--foreground-muted)] capitalize">{result.type}</span>
            </button>
          ))}
        </div>
        {/* Footer */}
        <div className="px-4 py-2 border-t border-[var(--gray-200)] flex items-center justify-between">
          <span className="text-xs text-[var(--foreground-muted)]">
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--background-secondary)] text-[var(--foreground-muted)] font-mono text-[10px]">⌘K</kbd> para pesquisar
          </span>
          <span className="text-xs text-[var(--foreground-muted)]">
            {results.length} resultado{results.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
