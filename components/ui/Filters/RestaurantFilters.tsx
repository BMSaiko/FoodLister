"use client";

import React, { useState, useMemo } from "react";
import { SlidersHorizontal, X, Star, Euro, MapPin, ChevronDown, UtensilsCrossed } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  rating?: number;
  price_per_person?: number;
  location?: string;
  visited: boolean;
  cuisine_types: any[];
}

interface Filters {
  cuisines: string[];
  priceMin: number | null;
  priceMax: number | null;
  ratingMin: number | null;
  visitedOnly: boolean;
}

interface RestaurantFiltersProps {
  restaurants: Restaurant[];
  onFiltered: (filtered: Restaurant[]) => void;
}

const DEFAULT_FILTERS: Filters = {
  cuisines: [],
  priceMin: null,
  priceMax: null,
  ratingMin: null,
  visitedOnly: false,
};

export default function RestaurantFilters({ restaurants, onFiltered }: RestaurantFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  // Extract unique cuisines
  const availableCuisines = useMemo(() => {
    const map = new Map<string, number>();
    restaurants.forEach(r => {
      (r.cuisine_types || []).forEach((c: any) => {
        const name = c.cuisine_type?.name || c.name || "Outro";
        map.set(name, (map.get(name) || 0) + 1);
      });
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [restaurants]);

  // Apply filters
  const filtered = useMemo(() => {
    return restaurants.filter(r => {
      if (filters.cuisines.length > 0) {
        const rCuisines = (r.cuisine_types || []).map((c: any) => c.cuisine_type?.name || c.name);
        if (!filters.cuisines.some(c => rCuisines.includes(c))) return false;
      }
      if (filters.priceMin != null && (r.price_per_person ?? 0) < filters.priceMin) return false;
      if (filters.priceMax != null && (r.price_per_person ?? Infinity) > filters.priceMax) return false;
      if (filters.ratingMin != null && (r.rating ?? 0) < filters.ratingMin) return false;
      if (filters.visitedOnly && !r.visited) return false;
      return true;
    });
  }, [restaurants, filters]);

  // Notify parent of filtered results
  React.useEffect(() => {
    onFiltered(filtered);
  }, [filtered, onFiltered]);

  const activeCount = useMemo(() => {
    let c = 0;
    if (filters.cuisines.length > 0) c++;
    if (filters.priceMin != null || filters.priceMax != null) c++;
    if (filters.ratingMin != null) c++;
    if (filters.visitedOnly) c++;
    return c;
  }, [filters]);

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  return (
    <div className="mb-6 md:mb-8">
      {/* Filter toggle + stats */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 min-h-[48px] ${
            showFilters || activeCount > 0
              ? "bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/25"
              : "bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08]"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filtros Avancados</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center">{activeCount}</span>
          )}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`} />
        </button>

        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 transition-colors">
              <X className="h-3 w-3" />
              Limpar
            </button>
          )}
          <p className="text-sm text-white/30">
            <span className="text-white/60 font-medium">{filtered.length}</span>
            {filtered.length !== restaurants.length && <span> de {restaurants.length}</span>}
            {" "}restaurantes
          </p>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-5">
          {/* Cuisine filter */}
          {availableCuisines.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <UtensilsCrossed className="h-4 w-4 text-amber-400/60" />
                <span className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-medium">Culinaria</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableCuisines.map(([name, count]) => (
                  <button
                    key={name}
                    onClick={() => setFilters(f => ({
                      ...f,
                      cuisines: f.cuisines.includes(name) ? f.cuisines.filter(c => c !== name) : [...f.cuisines, name]
                    }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
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
            <div className="flex items-center gap-2 mb-3">
              <Euro className="h-4 w-4 text-orange-400/60" />
              <span className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-medium">Preco</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <Euro className="h-3.5 w-3.5 text-white/25" />
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceMin ?? ""}
                  onChange={e => setFilters(f => ({ ...f, priceMin: e.target.value ? Number(e.target.value) : null }))}
                  className="w-14 bg-transparent text-sm text-white/80 placeholder:text-white/20 focus:outline-none"
                />
              </div>
              <span className="text-white/15">—</span>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <Euro className="h-3.5 w-3.5 text-white/25" />
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
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-amber-400/60" />
              <span className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-medium">Rating minimo</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(r => (
                <button
                  key={r}
                  onClick={() => setFilters(f => ({ ...f, ratingMin: f.ratingMin === r ? null : r }))}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
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

          {/* Visited filter */}
          <div>
            <button
              onClick={() => setFilters(f => ({ ...f, visitedOnly: !f.visitedOnly }))}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                filters.visitedOnly
                  ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25"
                  : "bg-white/[0.04] text-white/45 border border-white/[0.06] hover:bg-white/[0.08]"
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span>So visitados</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
