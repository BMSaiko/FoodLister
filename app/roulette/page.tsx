"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import Navbar from "@/components/ui/navigation/Navbar";
import RestaurantRoulette from "@/components/ui/RestaurantRoulette";
import RestaurantCard from "@/components/ui/RestaurantCard";
import { Shuffle, Sparkles, List, SlidersHorizontal, X, ChevronDown, Star, Euro } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  image_url?: string;
  images?: string[];
  rating?: number;
  price_per_person?: number;
  location?: string;
  cuisine_types: any[];
  features?: any[];
  dietary_options?: any[];
  created_at?: string;
  updated_at?: string;
}

interface UserList {
  id: string;
  name: string;
  restaurant_count: number;
  restaurants?: Restaurant[];
}

// Filter state
interface Filters {
  cuisines: string[];
  priceMin: number | null;
  priceMax: number | null;
  ratingMin: number | null;
}

const DEFAULT_FILTERS: Filters = {
  cuisines: [],
  priceMin: null,
  priceMax: null,
  ratingMin: null,
};

export default function RoulettePage() {
  const { user } = useAuth();
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [userLists, setUserLists] = useState<UserList[]>([]);
  const [listCache, setListCache] = useState<Record<string, Restaurant[]>>({});
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState<string | null>(null);
  const [showRoulette, setShowRoulette] = useState(false);
  const [source, setSource] = useState<"all" | string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  // Fetch all restaurants
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch("/api/restaurants?limit=200");
        if (res.ok) {
          const data = await res.json();
          setAllRestaurants(data.restaurants || []);
        }
        if (user) {
          const listsRes = await fetch("/api/lists?limit=50");
          if (listsRes.ok) {
            const listsData = await listsRes.json();
            setUserLists(listsData.lists || []);
          }
        }
      } catch (e) { console.error("Error fetching data:", e); }
      finally { setLoading(false); }
    }
    fetchData();
  }, [user]);

  // Fetch restaurants for a specific list when selected
  const fetchListRestaurants = useCallback(async (listId: string) => {
    if (listCache[listId]) return listCache[listId];
    setListLoading(listId);
    try {
      const res = await fetch(`/api/lists/${listId}`);
      if (res.ok) {
        const data = await res.json();
        const restaurants = (data.list?.restaurants || []).map((r: any) => ({
          ...r,
          cuisine_types: r.restaurant_cuisine_types?.map((ct: any) => ct.cuisine_types) || [],
        }));
        setListCache(prev => ({ ...prev, [listId]: restaurants }));
        return restaurants;
      }
    } catch (e) { console.error("Error fetching list:", e); }
    finally { setListLoading(null); }
    return [];
  }, [listCache]);

  // Handle source change
  const handleSourceChange = async (newSource: "all" | string) => {
    setSource(newSource);
    setFilters(DEFAULT_FILTERS);
    if (newSource !== "all") {
      await fetchListRestaurants(newSource);
    }
  };

  // Source restaurants (before filters)
  const sourceRestaurants = useMemo(() => {
    if (source === "all") return allRestaurants;
    return listCache[source] || [];
  }, [source, allRestaurants, listCache]);

  // Extract unique cuisines from source
  const availableCuisines = useMemo(() => {
    const map = new Map<string, number>();
    sourceRestaurants.forEach(r => {
      (r.cuisine_types || []).forEach((c: any) => {
        const name = c.cuisine_type?.name || c.name || "Outro";
        map.set(name, (map.get(name) || 0) + 1);
      });
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [sourceRestaurants]);

  // Apply filters
  const filteredRestaurants = useMemo(() => {
    return sourceRestaurants.filter(r => {
      // Cuisine filter
      if (filters.cuisines.length > 0) {
        const rCuisines = (r.cuisine_types || []).map((c: any) => c.cuisine_type?.name || c.name);
        if (!filters.cuisines.some(c => rCuisines.includes(c))) return false;
      }
      // Price filter
      if (filters.priceMin != null && (r.price_per_person ?? 0) < filters.priceMin) return false;
      if (filters.priceMax != null && (r.price_per_person ?? Infinity) > filters.priceMax) return false;
      // Rating filter
      if (filters.ratingMin != null && (r.rating ?? 0) < filters.ratingMin) return false;
      return true;
    });
  }, [sourceRestaurants, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.cuisines.length > 0) count++;
    if (filters.priceMin != null || filters.priceMax != null) count++;
    if (filters.ratingMin != null) count++;
    return count;
  }, [filters]);

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  return (
    <div className="min-h-[100dvh]" style={{ backgroundColor: "var(--background)" }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/15 mb-5">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Roleta</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">
            Roleta de Restaurantes
          </h1>
          <p className="text-lg text-white/40 max-w-xl mx-auto">
            Nao consegue decidir onde comer? Deixe a roleta escolher o restaurante perfeito para si.
          </p>
        </div>

        {/* Source + Filters + Spin */}
        <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/[0.06] mb-8 space-y-4">
          {/* Source selector */}
          <div>
            <span className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-medium mb-2 block">Fonte</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSourceChange("all")}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                  source === "all"
                    ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25"
                    : "bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08]"
                }`}
              >
                Todos ({allRestaurants.length})
              </button>
              {userLists.map(list => (
                <button
                  key={list.id}
                  onClick={() => handleSourceChange(list.id)}
                  disabled={listLoading === list.id}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                    source === list.id
                      ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25"
                      : "bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08]"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {listLoading === list.id ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin" />
                    ) : (
                      <List className="h-3.5 w-3.5" />
                    )}
                    {list.name.length > 18 ? list.name.slice(0, 18) + "..." : list.name}
                    <span className="text-white/25">({list.restaurant_count})</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Filter toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                showFilters || activeFilterCount > 0
                  ? "bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/25"
                  : "bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08]"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filtros</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>
              )}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 ${showFilters ? "rotate-180" : ""}`} />
            </button>

            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 transition-colors">
                <X className="h-3 w-3" />
                Limpar filtros
              </button>
            )}
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-4">
              {/* Cuisine filter */}
              {availableCuisines.length > 0 && (
                <div>
                  <span className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-medium mb-2 block">Culinaria</span>
                  <div className="flex flex-wrap gap-2">
                    {availableCuisines.map(([name, count]) => (
                      <button
                        key={name}
                        onClick={() => setFilters(f => ({
                          ...f,
                          cuisines: f.cuisines.includes(name)
                            ? f.cuisines.filter(c => c !== name)
                            : [...f.cuisines, name]
                        }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 ${
                          filters.cuisines.includes(name)
                            ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25"
                            : "bg-white/[0.04] text-white/45 border border-white/[0.06] hover:bg-white/[0.08]"
                        }`}
                      >
                        {name} <span className="text-white/20 ml-0.5">{count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price filter */}
              <div>
                <span className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-medium mb-2 block">Preco</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    <Euro className="h-3.5 w-3.5 text-white/30" />
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceMin ?? ""}
                      onChange={e => setFilters(f => ({ ...f, priceMin: e.target.value ? Number(e.target.value) : null }))}
                      className="w-14 bg-transparent text-sm text-white/80 placeholder:text-white/20 focus:outline-none"
                    />
                  </div>
                  <span className="text-white/20">—</span>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    <Euro className="h-3.5 w-3.5 text-white/30" />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceMax ?? ""}
                      onChange={e => setFilters(f => ({ ...f, priceMax: e.target.value ? Number(e.target.value) : null }))}
                      className="w-14 bg-transparent text-sm text-white/80 placeholder:text-white/20 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Rating filter */}
              <div>
                <span className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-medium mb-2 block">Rating minimo</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(r => (
                    <button
                      key={r}
                      onClick={() => setFilters(f => ({ ...f, ratingMin: f.ratingMin === r ? null : r }))}
                      className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-150 ${
                        filters.ratingMin === r
                          ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25"
                          : "bg-white/[0.04] text-white/45 border border-white/[0.06] hover:bg-white/[0.08]"
                      }`}
                    >
                      {r}<Star className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              </div>


            </div>
          )}

          {/* Spin button */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-white/30">
              {filteredRestaurants.length} restaurante{filteredRestaurants.length !== 1 ? "s" : ""} disponivel{filteredRestaurants.length !== 1 ? "is" : ""}
              {activeFilterCount > 0 && <span className="text-purple-400/60"> (filtrados de {sourceRestaurants.length})</span>}
            </p>
            <button
              onClick={() => setShowRoulette(true)}
              disabled={filteredRestaurants.length === 0}
              className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-bold text-base transition-colors duration-300 min-h-[52px] ${
                filteredRestaurants.length === 0
                  ? "bg-white/[0.04] text-white/20 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 text-white hover:shadow-xl hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              <Shuffle className="h-5 w-5" />
              <span>Girar Roleta</span>
            </button>
          </div>
        </div>

        {/* Restaurant preview grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse h-64 rounded-2xl bg-white/[0.04]" />
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎰</div>
            <h3 className="text-xl font-bold text-white/50 mb-2">
              {sourceRestaurants.length === 0 ? "Sem restaurantes" : "Sem resultados"}
            </h3>
            <p className="text-white/30">
              {sourceRestaurants.length === 0
                ? "Selecione uma lista com restaurantes ou use todos."
                : "Ajuste os filtros para encontrar restaurantes."}
            </p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRestaurants.slice(0, 9).map(r => (
                <RestaurantCard key={r.id} restaurant={r as any} />
              ))}
            </div>
            {filteredRestaurants.length > 9 && (
              <p className="text-center text-sm text-white/20 mt-4">+{filteredRestaurants.length - 9} mais</p>
            )}
          </div>
        )}
      </div>

      {/* Roulette Modal */}
      {showRoulette && (
        <RestaurantRoulette
          restaurants={filteredRestaurants}
          onClose={() => setShowRoulette(false)}
        />
      )}
    </div>
  );
}
