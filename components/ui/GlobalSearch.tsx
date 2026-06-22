"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, X, Loader2, Utensils, List, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { getClient } from "@/libs/supabase/client";

interface SearchResult {
  id: string;
  type: "restaurant" | "list" | "user";
  title: string;
  subtitle?: string;
  userIdCode?: string;
}

let openSearchHandler: (() => void) | null = null;

export function registerSearchOpener(fn: () => void) {
  openSearchHandler = fn;
}

export function openGlobalSearch() {
  openSearchHandler?.();
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Register opener
  useEffect(() => {
    registerSearchOpener(() => {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    });
    return () => { openSearchHandler = null; };
  }, []);

  // Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setQuery("");
        setActiveIndex(-1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0 && activeIndex < results.length) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    }
  }, [results, activeIndex]);

  // Scroll active into view
  useEffect(() => {
    if (activeIndex >= 0 && resultsRef.current) {
      const item = resultsRef.current.querySelector(`[data-index="${activeIndex}"]`);
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  // Reset active index on results change
  useEffect(() => {
    setActiveIndex(results.length > 0 ? 0 : -1);
  }, [results]);

  // Debounced search
  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const supabase = getClient();
      const [restaurants, lists, users] = await Promise.all([
        supabase.from("restaurants").select("id, name, location").ilike("name", `%${q}%`).limit(5),
        supabase.from("lists").select("id, name, description").ilike("name", `%${q}%`).eq("is_public", true).limit(5),
        supabase.from("profiles").select("id, display_name, user_id_code").or(`display_name.ilike.%${q}%,user_id_code.ilike.%${q}%`).limit(3),
      ]);
      const combined: SearchResult[] = [
        ...((restaurants.data || []) as Array<{ id: string; name: string; location?: string }>).map(r => ({
          id: r.id, type: "restaurant" as const, title: r.name, subtitle: r.location || undefined,
        })),
        ...((lists.data || []) as Array<{ id: string; name: string; description?: string }>).map(l => ({
          id: l.id, type: "list" as const, title: l.name, subtitle: l.description || undefined,
        })),
        ...((users.data || []) as Array<{ id: string; display_name: string; user_id_code?: string }>).map(u => ({
          id: u.id, type: "user" as const, title: u.display_name,
          subtitle: u.user_id_code ? `#${u.user_id_code}` : undefined,
          userIdCode: u.user_id_code || undefined,
        })),
      ];
      setResults(combined);
    } catch (err) {
      console.error("Search error:", err);
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
    setQuery("");
    setActiveIndex(-1);
    if (result.type === "restaurant") router.push(`/restaurants/${result.id}`);
    else if (result.type === "list") router.push(`/lists/${result.id}`);
    else if (result.type === "user") router.push(`/users/${result.userIdCode || result.id}`);
  };

  if (!isOpen) return null;

  const grouped = [
    { type: "restaurant" as const, label: "Restaurantes", icon: Utensils, items: results.filter(r => r.type === "restaurant") },
    { type: "list" as const, label: "Listas", icon: List, items: results.filter(r => r.type === "list") },
    { type: "user" as const, label: "Utilizadores", icon: User, items: results.filter(r => r.type === "user") },
  ].filter(g => g.items.length > 0);

  let flatIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Pesquisa global"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => { setIsOpen(false); setQuery(""); setActiveIndex(-1); }}
        aria-hidden="true"
      />
      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-[#0a0a0a] rounded-2xl shadow-2xl border border-white/[0.08] overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
          {loading ? (
            <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-white/25" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar restaurantes, listas, utilizadores..."
            className="flex-1 bg-transparent text-white/90 placeholder:text-white/25 outline-none text-sm"
            aria-label="Pesquisa global"
            aria-activedescendant={activeIndex >= 0 ? `result-${activeIndex}` : undefined}
            aria-controls="search-results"
            autoComplete="off"
          />
          <button
            onClick={() => { setIsOpen(false); setQuery(""); setActiveIndex(-1); }}
            className="p-1 rounded-md hover:bg-white/[0.06] transition-colors"
            aria-label="Fechar pesquisa"
          >
            <X className="h-4 w-4 text-white/25" />
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
            <div className="px-4 py-8 text-center text-sm text-white/30">
              Sem resultados para &quot;{query}&quot;
            </div>
          )}
          {results.length === 0 && !query.trim() && (
            <div className="px-4 py-8 text-center text-sm text-white/30">
              Escreva para pesquisar restaurantes, listas e utilizadores
            </div>
          )}
          {grouped.map((group) => (
            <div key={group.type} role="group" aria-labelledby={`group-${group.type}`}>
              <div
                id={`group-${group.type}`}
                className="px-4 py-2 text-[10px] font-semibold text-white/25 uppercase tracking-wider bg-white/[0.02]"
              >
                <group.icon className="h-3 w-3 inline mr-1.5 -mt-0.5" />
                {group.label}
              </div>
              {group.items.map((result) => {
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
                      isActive ? "bg-purple-500/10 outline-none" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      result.type === "restaurant" ? "bg-amber-500/10 text-amber-400" :
                      result.type === "list" ? "bg-emerald-500/10 text-emerald-400" :
                      "bg-blue-500/10 text-blue-400"
                    }`}>
                      {result.type === "restaurant" ? <Utensils className="h-4 w-4" /> :
                       result.type === "list" ? <List className="h-4 w-4" /> :
                       <User className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/80 truncate">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-xs text-white/30 truncate">{result.subtitle}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-white/20 capitalize">
                      {result.type === "restaurant" ? "Restaurante" : result.type === "list" ? "Lista" : "Utilizador"}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-[10px] text-white/25">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] text-white/25 font-mono text-[9px]">⌘K</kbd> para pesquisar
          </span>
          <span className="text-[10px] text-white/25">
            {results.length} resultado{results.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
