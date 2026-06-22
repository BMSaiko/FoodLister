"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

import { Search, X, Loader2, UtensilsCrossed, List, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { getClient } from "@/libs/supabase/client";

interface SearchResult {
  id: string;
  type: "restaurant" | "list" | "user";
  title: string;
  subtitle?: string;
}

import { useSearch } from "@/contexts/SearchContext";

export default function GlobalSearchModal() {
  const { searchOpen, setSearchOpen } = useSearch();
  const onClose = () => setSearchOpen(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const supabase = getClient();
      const [restRes, listsRes] = await Promise.all([
        supabase.from("restaurants").select("id, name, location").ilike("name", `%${q}%`).limit(5),
        supabase.from("lists").select("id, name, description").ilike("name", `%${q}%`).limit(5).eq("is_public", true),
      ]);
      const items: SearchResult[] = [];
      (restRes.data || []).forEach((r: any) => items.push({ id: r.id, type: "restaurant", title: r.name, subtitle: r.location }));
      (listsRes.data || []).forEach((l: any) => items.push({ id: l.id, type: "list", title: l.name }));
      setResults(items);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleSelect = (item: SearchResult) => {
    if (item.type === "restaurant") router.push(`/restaurants/${item.id}`);
    else if (item.type === "list") router.push(`/lists/${item.id}`);
    onClose();
  };

  const grouped = [
    { type: "restaurant" as const, label: "Restaurantes", icon: UtensilsCrossed, items: results.filter(r => r.type === "restaurant") },
    { type: "list" as const, label: "Listas", icon: List, items: results.filter(r => r.type === "list") },
  ].filter(g => g.items.length > 0);

  let flatIndex = -1;

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#0a0a0a] border border-white/[0.08] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
          <Search className="h-5 w-5 text-white/25 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar restaurantes, listas..."
            className="flex-1 bg-transparent text-white/90 placeholder:text-white/25 text-sm focus:outline-none"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-white/25" />}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-white/20 bg-white/[0.04] border border-white/[0.06]">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {grouped.length === 0 && query.length > 0 && !loading && (
            <p className="px-4 py-8 text-center text-sm text-white/30">Sem resultados para "{query}"</p>
          )}
          {grouped.length === 0 && query.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-white/30">Pesquisa por restaurantes, listas e utilizadores</p>
          )}
          {grouped.map((group) => (
            <div key={group.type}>
              <div className="flex items-center gap-2 px-4 py-2">
                <group.icon className="h-3.5 w-3.5 text-white/25" />
                <span className="text-[10px] font-semibold text-white/25 uppercase tracking-wider">{group.label}</span>
              </div>
              {group.items.map((item) => {
                flatIndex++;
                const idx = flatIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={"w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors " + (activeIndex === idx ? "bg-white/[0.06]" : "hover:bg-white/[0.03]")}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                      {item.type === "restaurant" ? <UtensilsCrossed className="h-4 w-4 text-amber-400/60" /> : <List className="h-4 w-4 text-emerald-400/60" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80 truncate">{item.title}</p>
                      {item.subtitle && <p className="text-xs text-white/30 truncate">{item.subtitle}</p>}
                    </div>
                    <ArrowRightIcon className="h-3.5 w-3.5 text-white/15 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
