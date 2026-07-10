"use client";

import { useState, useEffect } from "react";
import { MapPin, Search, X, SlidersHorizontal, Navigation } from "lucide-react";
import { useRestaurants } from "@/hooks/data/useRestaurants";
import {
  useNearbyRestaurants,
  type NearbyRestaurant,
} from "@/hooks/restaurants/useNearbyRestaurants";
import { RestaurantGrid } from "@/components/ui/RestaurantList/RestaurantGrid";
import type { RestaurantWithDetails } from "@/libs/types";

type Mode = "all" | "nearby";
type SortKey = "rating" | "price" | "name" | "review_count";

const SORT_OPTIONS: { key: SortKey; dir: "asc" | "desc"; label: string }[] = [
  { key: "rating", dir: "desc", label: "Melhor avaliados" },
  { key: "review_count", dir: "desc", label: "Mais avaliações" },
  { key: "price", dir: "asc", label: "Mais baratos" },
  { key: "price", dir: "desc", label: "Mais caros" },
  { key: "name", dir: "asc", label: "Nome (A–Z)" },
];

export default function RestaurantsPage() {
  const [mode, setMode] = useState<Mode>("all");
  const [search, setSearch] = useState("");
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [openNow, setOpenNow] = useState(false);
  const [sort, setSort] = useState<SortKey>("rating");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  // Geolocation mode state
  const [radius, setRadius] = useState(10);
  const {
    restaurants: nearby,
    loading: nearbyLoading,
    error: nearbyError,
    userLocation,
    locationError,
    requestLocation,
    searchNearby,
  } = useNearbyRestaurants({ autoFetch: false });

  const {
    restaurants,
    loading,
    loadingMore,
    hasMore,
    sentinelRef,
    loadMore,
  } = useRestaurants({
    searchQuery: search.trim() || null,
    priceMin,
    priceMax,
    openNow: openNow || null,
    sortBy: sort,
    sortDirection: direction,
  });

  // Re-run nearby search whenever we have a location (or radius changes)
  useEffect(() => {
    if (mode === "nearby" && userLocation) {
      searchNearby({ radius, sortBy: "distance", sortDirection: "asc" });
    }
  }, [mode, userLocation, radius, searchNearby]);

  const handleLocate = () => {
    requestLocation();
  };

  const onSortChange = (value: string) => {
    const opt = SORT_OPTIONS.find((o) => `${o.key}:${o.dir}` === value);
    if (opt) {
      setSort(opt.key);
      setDirection(opt.dir);
    }
  };

  const clearFilters = () => {
    setPriceMin(null);
    setPriceMax(null);
    setOpenNow(false);
    setSearch("");
  };

  const activeCount =
    (priceMin != null || priceMax != null ? 1 : 0) +
    (openNow ? 1 : 0) +
    (search.trim() ? 1 : 0);

  const nearbyMapped = nearby.map((r: NearbyRestaurant) => ({
    ...r,
    cuisine_types: [],
    reviews: [],
    images: r.images ?? [],
  })) as unknown as RestaurantWithDetails[];

  return (
    <main className="min-h-[100dvh] px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Restaurantes</h1>
        {/* Mode toggle */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
          <button
            onClick={() => setMode("all")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              mode === "all"
                ? "bg-purple-500/20 text-purple-300"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setMode("nearby")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              mode === "nearby"
                ? "bg-purple-500/20 text-purple-300"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            <MapPin className="h-4 w-4" />
            Perto de mim
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar restaurantes..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-white placeholder-white/40 outline-none focus:ring-1 focus:ring-purple-500/40"
        />
      </div>

      {/* Filters (Todos mode) */}
      {mode === "all" && (
        <div className="mb-6 p-4 rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white/70">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros e ordenação
              {activeCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </div>
            {activeCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60"
              >
                <X className="h-3 w-3" /> Limpar
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Price range */}
            <div>
              <p className="text-xs text-white/50 mb-2">
                Preço por pessoa: €{priceMin ?? 0} – {priceMax != null ? `€${priceMax}` : "∞"}
              </p>
              <label className="block text-[11px] text-white/40">Mínimo</label>
              <input
                type="range"
                min={0}
                max={200}
                step={5}
                value={priceMin ?? 0}
                onChange={(e) =>
                  setPriceMin(Number(e.target.value) || null)
                }
                className="w-full accent-purple-500"
              />
              <label className="block text-[11px] text-white/40 mt-1">Máximo</label>
              <input
                type="range"
                min={0}
                max={200}
                step={5}
                value={priceMax ?? 200}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setPriceMax(v >= 200 ? null : v);
                }}
                className="w-full accent-purple-500"
              />
            </div>

            {/* Open now */}
            <div className="flex flex-col justify-between">
              <p className="text-xs text-white/50 mb-2">Estado</p>
              <button
                onClick={() => setOpenNow((v) => !v)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors min-h-[48px] ${
                  openNow
                    ? "bg-green-500/15 text-green-400 ring-1 ring-green-500/25"
                    : "bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08]"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${openNow ? "bg-green-400" : "bg-white/30"}`} />
                Aberto agora
              </button>
            </div>

            {/* Sort */}
            <div>
              <p className="text-xs text-white/50 mb-2">Ordenar por</p>
              <select
                value={`${sort}:${direction}`}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-white text-sm outline-none focus:ring-1 focus:ring-purple-500/40"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={`${o.key}:${o.dir}`} value={`${o.key}:${o.dir}`} className="bg-[#1a1a1a]">
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Geolocation panel (Perto de mim mode) */}
      {mode === "nearby" && (
        <div className="mb-6 p-4 rounded-3xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center gap-4">
          <button
            onClick={handleLocate}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-500/15 text-purple-300 text-sm font-semibold ring-1 ring-purple-500/25"
          >
            <Navigation className="h-4 w-4" />
            Usar minha localização
          </button>
          <label className="flex items-center gap-2 text-sm text-white/60">
            Raio:
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm outline-none"
            >
              {[5, 10, 25, 50].map((r) => (
                <option key={r} value={r} className="bg-[#1a1a1a]">
                  {r} km
                </option>
              ))}
            </select>
          </label>
          {locationError && (
            <p className="text-xs text-red-400">{locationError}</p>
          )}
          {nearbyError && (
            <p className="text-xs text-red-400">{nearbyError}</p>
          )}
          {userLocation && (
            <p className="text-xs text-white/40">
              {nearby.length} encontrados · {radius} km
            </p>
          )}
        </div>
      )}

      {/* Results */}
      {mode === "all" ? (
        <>
          <RestaurantGrid restaurants={restaurants} searchQuery={search.trim() || null} />
          {loading && restaurants.length === 0 && (
            <p className="text-center text-white/40 py-10">A carregar...</p>
          )}
          {hasMore && (
            <div ref={sentinelRef} className="h-10" />
          )}
          {hasMore && (
            <div className="flex justify-center mt-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-white/70 text-sm font-semibold disabled:opacity-50"
              >
                {loadingMore ? "A carregar..." : "Carregar mais"}
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <RestaurantGrid restaurants={nearbyMapped} />
          {nearbyLoading && (
            <p className="text-center text-white/40 py-10">A carregar...</p>
          )}
          {!nearbyLoading && nearby.length === 0 && !locationError && (
            <p className="text-center text-white/40 py-10">
              Usa “Usar minha localização” para ver restaurantes perto de ti.
            </p>
          )}
        </>
      )}
    </main>
  );
}
