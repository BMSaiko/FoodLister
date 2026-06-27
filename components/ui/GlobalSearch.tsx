"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, X, Loader2, Utensils, List, User } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { getClient } from "@/libs/supabase/client";
import Modal from "@/components/ui/Modal";

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
  const pathname = usePathname();

  // Close modal on route change
  useEffect(() => {
    setIsOpen(false);
    setQuery("");
    setActiveIndex(-1);
  }, [pathname]);

  // Register opener
  useEffect(() => {
    registerSearchOpener(() => {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    });
    return () => { openSearchHandler = null; };
  }, []);

  // Cmd+K / Ctrl+K and ESC
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
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!query.trim()) { setResults([]); return; }
      setLoading(true);
      search(query.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const search = async (q: string) => {
    try {
      const supabase = getClient();
      const [restaurants, lists, users] = await Promise.all([
        supabase.from("restaurants").select("id, name, location").ilike("name", `%${q}%`).limit(5),
        supabase.from("lists").select("id, name, description").ilike("name", `%${q}%`).eq("is_public", true).limit(5),
        supabase.from("profiles").select("id, display_name, user_id_code").or(`display_name.ilike.%${q}%,user_id_code.ilike.%${q}%`).limit(3),
      ]);
      const combined: SearchResult[] = [
        ...((restaurants.data || []) as any[]).map((r: any) => ({
          id: r.id, type: "restaurant" as const, title: r.name, subtitle: r.location || undefined,
        })),
        ...((lists.data || []) as any[]).map((l: any) => ({
          id: l.id, type: "list" as const, title: l.name, subtitle: l.description || undefined,
        })),
        ...((users.data || []) as any[]).map((u: any) => ({
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
  };

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
    <Modal
      isOpen={isOpen}
      onClose={() => { setIsOpen(false); setQuery(""); setActiveIndex(-1); }}
      size="lg"
      ariaLabel="Pesquisa global"
    >
      {/* Input */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.08]">
        {loading ? (
          <Loader2 className="h-5 w-5 text-amber-400 animate-spin flex-shrink-0" />
        ) : (
          <Search className="h-5 w-5 text-white/30 flex-shrink-0" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pesquisar restaurantes, listas, utilizadores..."
          className="flex-1 bg-transparent text-white/90 placeholder:text-white/30 outline-none text-base"
          aria-label="Pesquisa global"
          aria-activedescendant={activeIndex >= 0 ? `result-${activeIndex}` : undefined}
          aria-controls="search-results"
          autoComplete="off"
        />
        <button
          onClick={() => { setIsOpen(false); setQuery(""); setActiveIndex(-1); }}
          className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors flex-shrink-0"
          aria-label="Fechar pesquisa"
        >
          <X className="h-4 w-4 text-white/40" />
        </button>
      </div>

      {/* Results */}
      <div
        id="search-results"
        ref={resultsRef}
        className="overflow-y-auto overscroll-contain"
        style={{ maxHeight: "min(60vh, 400px)" }}
        role="listbox"
        aria-label="Resultados da pesquisa"
        aria-live="polite"
      >
        {query.trim() && !loading && results.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-white/40">
            Sem resultados para &apos;{query}&apos;
          </div>
        )}
        {!query.trim() && results.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-white/40">
            Escreva para pesquisar restaurantes, listas e utilizadores
          </div>
        )}
        {loading && (
          <div className="flex items-center gap-2 px-4 py-6 justify-center text-white/30 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            A pesquisar...
          </div>
        )}
        {grouped.map((group) => (
          <div key={group.type} role="group" aria-labelledby={`group-${group.type}`}>
            <div
              id={`group-${group.type}`}
              className="px-4 py-2 text-[10px] font-semibold text-white/30 uppercase tracking-wider bg-white/[0.02] sticky top-0"
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
                    isActive ? "bg-amber-500/10" : "hover:bg-white/[0.04]"
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
                    <p className="text-sm font-medium text-white/85 truncate">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-xs text-white/35 truncate">{result.subtitle}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-white/25 capitalize flex-shrink-0">
                    {result.type === "restaurant" ? "Restaurante" : result.type === "list" ? "Lista" : "Utilizador"}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-white/[0.08] flex items-center justify-between">
        <span className="text-[10px] text-white/30">
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-white/40 font-mono text-[9px]">⌘K</kbd>
          {" "}para pesquisar
        </span>
        {results.length > 0 && (
          <span className="text-[10px] text-white/30">
            {results.length} resultado{results.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </Modal>
  );
}
