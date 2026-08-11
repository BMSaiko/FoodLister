"use client";

import "leaflet/dist/leaflet.css";


import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/ui/navigation/Navbar";
import { useAllRestaurants } from "@/hooks/data/useAllRestaurants";
import type { RestaurantWithDetails } from "@/libs/types";
import { Filter, Search } from "lucide-react";
import NearbyBar from "@/components/ui/Nearby/NearbyBar";
import { useNearbyRestaurants } from "@/hooks/restaurants/useNearbyRestaurants";
import Link from "next/link";

const RestaurantMap = dynamic(() => import("@/components/ui/RestaurantMap/RestaurantMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-[var(--background)] flex items-center justify-center">
      <div className="w-full h-full bg-white/[0.01] rounded-xl border border-white/[0.04] relative overflow-hidden">
        {/* Scan-line shimmer */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.03] to-transparent animate-pulse" />
        {/* Grid overlay */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Center spinner */}
        <div className="relative z-10 w-10 h-10 border-2 border-white/[0.08] border-t-amber-500/60 rounded-full animate-spin" />
        <p className="relative z-10 text-[11px] text-white/25 mt-3">A carregar mapa...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const { restaurants, loading, error } = useAllRestaurants(null);
  const [showList, setShowList] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [nearbyActive, setNearbyActive] = useState(false);
  const [nearbyRadius, setNearbyRadius] = useState(10);
  const nearby = useNearbyRestaurants();
  // ponytail: map recentres when nearby lookup returns a user location
  const nearbyCenter: [number, number] | null =
    nearbyActive && nearby.userLocation ? [nearby.userLocation.lat, nearby.userLocation.lng] : null;
  // ponytail: zoom scales with radius so all pins fit (2km->15, 5->14, 10->13, 25->12)
  const nearbyZoom = nearbyActive ? Math.max(11, 16 - Math.log2(nearbyRadius)) : 10;

  const restaurantsWithCoords = useMemo(
    () => restaurants.filter((r) => r.latitude != null && r.longitude != null),
    [restaurants]
  );
  const restaurantsWithoutCoords = useMemo(
    () => restaurants.filter((r) => r.latitude == null || r.longitude == null),
    [restaurants]
  );

  const searchLower = searchQuery.trim().toLowerCase();
  const filteredRestaurants = useMemo(() => {
    let base = restaurantsWithCoords;
    if (searchLower) {
      base = base.filter(
        r => r.name.toLowerCase().includes(searchLower) ||
             (r.location || "").toLowerCase().includes(searchLower)
      );
    }
    return base;
  }, [restaurantsWithCoords, searchLower]);

  // ponytail: when nearby is active, map shows only results within radius
  const mapRestaurants = nearbyActive && nearby.restaurants?.length
    ? nearby.restaurants
    : filteredRestaurants;

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <style>{`
  .leaflet-popup-content-wrapper {
    background: var(--card-bg) !important;
    border: 1px solid var(--card-border) !important;
    border-radius: 1rem !important;
    box-shadow: var(--card-shadow) !important;
    color: var(--foreground) !important;
  }
  .leaflet-popup-content {
    margin: 0.5rem 0.75rem !important;
    color: var(--foreground) !important;
  }
  .leaflet-popup-tip {
    background: var(--card-bg) !important;
    border: 1px solid var(--card-border) !important;
    border-top: none !important;
    border-radius: 0 0 1rem 1rem !important;
  }
  .leaflet-popup-close-button {
    color: var(--foreground-muted) !important;
    font-size: 1.1rem !important;
    top: 4px !important;
    right: 6px !important;
  }
  .leaflet-popup-close-button:hover {
    color: var(--foreground) !important;
  }
  .leaflet-popup-content a {
    transition: color 0.2s ease, gap 0.2s ease;
    color: #fbbf24 !important;
  }
  .leaflet-popup-content a:hover {
    color: #f59e0b !important;
    gap: 8px;
  }
  .leaflet-popup-content a svg {
    transition: transform 0.2s ease;
  }
  .leaflet-popup-content a:hover svg {
    transform: translateX(3px);
  }
`}</style>
      <div className="flex flex-col lg:flex-row h-[calc(100dvh-60px)] min-h-0">
        {/* Sidebar - Restaurant list */}
        <div
          className={`hidden lg:block w-80 xl:w-96 border-r border-white/[0.06] overflow-y-auto flex-shrink-0 min-h-0 ${
            showList ? "block" : ""
          }`}
        >
          <div className="p-4">

            {/* Sticky search bar */}
            <div className="sticky top-0 z-10 -mx-4 px-4 pt-4 pb-2 bg-[var(--background)]">
              <div className="mb-3">
                <NearbyBar
                  active={nearbyActive}
                  onToggle={() => { if (!nearbyActive) nearby.requestLocation(); setNearbyActive(v => !v); }}
                  radius={nearbyRadius}
                  onRadius={(r) => { setNearbyRadius(r); nearby.searchNearby({ radius: r }); }}
                  loading={nearby.loading}
                  error={nearby.error}
                  locationError={nearby.locationError}
                />
              </div>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                <input
                  type="text"
                  placeholder="Pesquisar restaurante..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white/90">
                Restaurantes no Mapa
              </h2>
              <span className="text-xs text-white/30 bg-white/[0.04] px-2.5 py-1 rounded-full">
                {mapRestaurants.length}
              </span>
            </div>

            {restaurantsWithoutCoords.length > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/[0.08] border border-amber-500/20">
                <p className="text-xs text-amber-400/80">
                  {restaurantsWithoutCoords.length} restaurante(s) sem coordenadas —{" "}
                  <Link
                    href="/restaurants/no-coords"
                    className="underline font-medium text-amber-400"
                  >
                    ver lista completa
                  </Link>
                </p>
              </div>
            )}

            {/* Restaurant list */}
            <div className="space-y-1.5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 rounded-xl bg-white/[0.03] border border-white/[0.06] animate-pulse"
                  />
                ))
              ) : error ? (
                <p className="text-sm text-red-400">Erro: {error}</p>
              ) : (nearbyActive && (nearby.loading || nearby.error)) ? (
                <p className="text-sm text-white/30">{nearby.loading ? 'A localizar...' : (nearby.error || 'Sem resultados Perto de..')}</p>
              ) : mapRestaurants.length === 0 ? (
                <p className="text-sm text-white/30">
                  {searchQuery ? "Nenhum resultado." : "A carregar..."}
                </p>
              ) : (
                mapRestaurants.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedId(r.id);
                      setShowList(false);
                    }}
                    className={`w-full text-left flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] transition-colors group ${
                      selectedId === r.id
                        ? "ring-1 ring-amber-500/30 bg-amber-500/[0.04]"
                        : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex-shrink-0 flex items-center justify-center">
                      <span className="text-amber-400/60">●</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white/90 truncate group-hover:text-amber-400 transition-colors">
                        {r.name}
                      </p>
                      <p className="text-xs text-white/30 truncate">
                        {r.location || "Sem localização"}
                      </p>
                    </div>
                    {r.rating != null && (
                      <span className="text-xs text-amber-400/70 ml-auto flex-shrink-0">
                        ★ {r.rating.toFixed(1)}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Map area */}
        <div className="flex-1 relative min-h-0">
          {/* Mobile: toggle list + search */}
          <div className="lg:hidden absolute top-2 left-2 z-[1001] flex gap-2">
            <button
              onClick={() => setShowList(!showList)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/60 backdrop-blur text-white/80 text-sm border border-white/[0.08]"
            >
              <Filter className="w-4 h-4" />
              {showList ? "Esconder lista" : `Lista (${filteredRestaurants.length})`}
            </button>
          </div>

          {/* Mobile sidebar overlay */}
          {showList && (
            <div className="lg:hidden absolute inset-x-0 top-14 bottom-0 z-[900] bg-[var(--background)] border-b border-white/[0.06] overflow-y-auto">
              <div className="p-4">
                <div className="mb-3">
                  <NearbyBar
                    active={nearbyActive}
                    onToggle={() => { if (!nearbyActive) nearby.requestLocation(); setNearbyActive(v => !v); }}
                    radius={nearbyRadius}
                    onRadius={(r) => { setNearbyRadius(r); nearby.searchNearby({ radius: r }); }}
                    loading={nearby.loading}
                    error={nearby.error}
                    locationError={nearby.locationError}
                  />
                </div>
                {/* Mobile search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                  <input
                    type="text"
                    placeholder="Pesquisar restaurante..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50"
                    >
                      ✕
                    </button>
                  )}
                </div>

<h2 className="text-sm font-bold text-white/90 mb-3">
                  Restaurantes ({mapRestaurants.length})
                </h2>
                {filteredRestaurants.slice(0, 30).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedId(r.id);
                      setShowList(false);
                    }}
                    className="block w-full text-left py-2.5 border-b border-white/[0.04] text-sm text-white/80 hover:text-amber-400 transition-colors"
                  >
                    {r.name} — {r.location || "Sem localização"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="h-full bg-[var(--background-secondary)] flex items-center justify-center">
              <div className="w-full h-full bg-white/[0.02] rounded-xl animate-pulse" />
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-red-400 text-sm">Erro ao carregar mapa: {error}</p>
            </div>
          ) : (
            <RestaurantMap
              restaurants={mapRestaurants as RestaurantWithDetails[]}
              selectedId={selectedId}
              onSelect={setSelectedId}
              focusCenter={nearbyCenter}
              focusZoom={nearbyZoom}
              userLocation={nearby.userLocation}
            />
          )}
        </div>
      </div>
    </main>
  );
}
