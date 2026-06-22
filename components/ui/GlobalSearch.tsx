'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { registerSearchOpener } from '@/utils/searchTrigger';
import { Search, X, Loader2, Utensils, List, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getClient } from '@/libs/supabase/client';

interface SearchResult {
  id: string;
  type: 'restaurant' | 'list' | 'user';
  title: string;
  subtitle?: string;
  userIdCode?: string;
}

interface GroupedResults {
  type: 'restaurant' | 'list' | 'user';
  label: string;
  results: SearchResult[];
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    registerSearchOpener(() => setIsOpen(true));
  }, []);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Cmd+K keyboard shortcut
  // Close modal on navigation
  useEffect(() => {
    if (!isOpen) return;
    const handlePopState = () => setIsOpen(false);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
        setActiveIndex(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Keyboard navigation within results
  const handleModalKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < results.length) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setQuery('');
      setActiveIndex(-1);
    }
  }, [results, activeIndex]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && resultsRef.current) {
      const activeItem = resultsRef.current.querySelector(`[data-index="${activeIndex}"]`);
      activeItem?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(results.length > 0 ? 0 : -1);
  }, [results]);

  // Debounced search
  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const supabase = getClient();
      const [restaurants, lists, users] = await Promise.all([
        supabase.from('restaurants')
          .select('id, name, location')
          .ilike('name', `%${q}%`)
          .limit(5),
        supabase.from('lists')
          .select('id, name, description')
          .ilike('name', `%${q}%`)
          .eq('is_public', true)
          .limit(5),
        supabase.from('profiles')
          .select('id, display_name, user_id_code')
          .or(`display_name.ilike.%${q}%,user_id_code.ilike.%${q}%`)
          .limit(3),
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
        ...((users.data || []) as Array<{ id: string; display_name: string; user_id_code?: string }>).map(u => ({
          id: u.id,
          type: 'user' as const,
          title: u.display_name,
          subtitle: u.user_id_code ? `#${u.user_id_code}` : undefined,
          userIdCode: u.user_id_code || undefined,
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
    setActiveIndex(-1);
    if (result.type === 'restaurant') {
      router.push(`/restaurants/${result.id}`);
    } else if (result.type === 'list') {
      router.push(`/lists/${result.id}`);
    } else if (result.type === 'user') {
      router.push(`/users/${result.userIdCode || result.id}`);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'restaurant':
        return <Utensils className="h-4 w-4" />;
      case 'list':
        return <List className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getResultIconBg = (type: string) => {
    switch (type) {
      case 'restaurant':
        return 'bg-amber-100 text-amber-600';
      case 'list':
        return 'bg-blue-100 text-blue-600';
      case 'user':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Group results by type
  const groupedResults: GroupedResults[] = results.length > 0
    ? ([
        { type: 'restaurant' as const, label: 'Restaurantes', results: results.filter(r => r.type === 'restaurant') },
        { type: 'list' as const, label: 'Listas', results: results.filter(r => r.type === 'list') },
        { type: 'user' as const, label: 'Utilizadores', results: results.filter(r => r.type === 'user') },
      ] as GroupedResults[]).filter(g => g.results.length > 0)
    : [];

  if (!isOpen) return null;

  let flatIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Pesquisa global"
      onKeyDown={handleModalKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => { setIsOpen(false); setQuery(''); setActiveIndex(-1); }}
        aria-hidden="true"
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
            placeholder="Pesquisar restaurantes, listas, utilizadores..."
            className="flex-1 bg-transparent text-[var(--foreground)] placeholder-[var(--foreground-muted)] outline-none text-sm"
            aria-label="Pesquisa global"
            aria-activedescendant={activeIndex >= 0 ? `result-${activeIndex}` : undefined}
            aria-controls="search-results"
            autoComplete="off"
          />
          <button
            onClick={() => { setIsOpen(false); setQuery(''); setActiveIndex(-1); }}
            className="p-1 rounded-md hover:bg-[var(--background-secondary)] transition-colors"
            aria-label="Fechar pesquisa"
          >
            <X className="h-4 w-4 text-[var(--foreground-muted)]" />
          </button>
        </div>
        {/* Results */}
        <div
          id="search-results"
          ref={resultsRef}
          className="max-h-80 overflow-y-auto"
          role="listbox"
          aria-label="Resultados da pesquisa"
          aria-live="polite"
        >
          {results.length === 0 && query.trim() && !loading && (
            <div className="px-4 py-8 text-center text-sm text-[var(--foreground-muted)]">
              Sem resultados para &quot;{query}&quot;
            </div>
          )}
          {results.length === 0 && !query.trim() && (
            <div className="px-4 py-8 text-center text-sm text-[var(--foreground-muted)]">
              Escreva para pesquisar restaurantes, listas e utilizadores
            </div>
          )}
          {groupedResults.map((group) => (
            <div key={group.type} role="group" aria-labelledby={`group-header-${group.type}`}>
              <div
                id={`group-header-${group.type}`}
                className="px-4 py-2 text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider bg-[var(--background-secondary)]"
              >
                {group.label}
              </div>
              {group.results.map((result) => {
                flatIndex++;
                const idx = flatIndex;
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    id={`result-${idx}`}
                    data-index={idx}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleSelect(result)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                      isActive
                        ? 'bg-[var(--primary-lighter)] outline-none'
                        : 'hover:bg-[var(--background-secondary)]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getResultIconBg(result.type)}`}>
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-xs text-[var(--foreground-muted)] truncate">{result.subtitle}</p>
                      )}
                    </div>
                    <span className="text-xs text-[var(--foreground-muted)] capitalize">
                      {result.type === 'restaurant' ? 'Restaurante' : result.type === 'list' ? 'Lista' : 'Utilizador'}
                    </span>
                  </button>
                );
              })}
            </div>
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
