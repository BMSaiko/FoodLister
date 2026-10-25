"use client";

import "leaflet/dist/leaflet.css";


import React, { useState, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/ui/navigation/Navbar";
import { useAllRestaurants } from "@/hooks/data/useAllRestaurants";
import type { RestaurantWithDetails } from "@/libs/types";
import Ico from "@/components/ui/icons/Ico";
import NearbyBar from "@/components/ui/Nearby/NearbyBar";
import { useNearbyRestaurants } from "@/hooks/restaurants/useNearbyRestaurants";
import Link from "next/link";
import { usePageTitle } from "@/hooks/usePageTitle";
import ToviLoader from "@/components/loading/ToviLoader";
import { thumbFor, toviFor } from "@/utils/restaurantThumb";

const RestaurantMap = dynamic(() => import("@/components/ui/RestaurantMap/RestaurantMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-[var(--background)] flex flex-col items-center justify-center">
      <ToviLoader size="sm" />
      <p className="text-[11px] text-white/50 mt-3">A carregar mapa...</p>
    </div>
  ),
});

const focusRing = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300";
const retryBtn = `min-h-[44px] px-4 rounded-full bg-amber-500/15 border border-amber-500/50 text-amber-300 text-sm ${focusRing}`;

type Sheet = 0 | 1 | 2; // fechada / meia / cheia

export default function MapPage() {
  usePageTitle("Mapa - FoodLister");
  const { restaurants, loading, error, refetch } = useAllRestaurants(null);
  const [sheet, setSheet] = useState<Sheet>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [nearbyActive, setNearbyActive] = useState(false);
  const [nearbyRadius, setNearbyRadius] = useState(10);
  const nearby = useNearbyRestaurants();
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
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

  // Atalhos: "/" foca a pesquisa, "Esc" fecha seleção e baixa a folha
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "Escape") {
        if (typing) el.blur();
        setSelectedId(null);
        setSheet((s) => (s === 2 ? 1 : s));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Setas ↑↓ navegam os itens da lista
  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const items = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>("button[data-item]") ?? []);
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    e.preventDefault();
    items[Math.min(items.length - 1, Math.max(0, i + (e.key === "ArrowDown" ? 1 : -1)))]?.focus();
  };

  const sheetHeight = ["h-14", "h-[42%]", "h-[78%]"][sheet];
  const nearbyStatus = nearbyActive && (nearby.loading || nearby.error);

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <style>{`
  .leaflet-container { background: #0d0d0d !important; }
  .leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(0.72) contrast(0.9) saturate(0.55); }
  .fl-popup { width: 240px; }
  .fl-popup-img { width: 100%; height: 108px; object-fit: cover; display: block; border-radius: 0.75rem 0.75rem 0 0; background: rgba(255,255,255,0.04); }
  .fl-popup-body { padding: 10px 12px 12px; }
  .fl-popup-title { font-size: 15px; font-weight: 700; line-height: 1.2; margin: 0; }
  .fl-popup-rating { margin: 4px 0 0; font-size: 12px; color: #fbbf24; }
  .fl-popup-rating i { font-style: normal; opacity: 0.25; }
  .fl-popup-muted { margin: 3px 0 0; font-size: 12px; color: rgba(255,255,255,0.55); }
  .leaflet-popup-content a.fl-popup-cta { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 10px; min-height: 40px; border-radius: 9999px; background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.5); font-size: 13px; font-weight: 600; text-decoration: none; }
  .leaflet-popup-content a.fl-popup-cta:hover { background: rgba(245,158,11,0.28); gap: 10px; }
  .leaflet-popup-content-wrapper {
    background: var(--card-bg) !important;
    border: 1px solid var(--card-border) !important;
    border-radius: 1rem !important;
    padding: 0 !important;
    overflow: hidden;
    box-shadow: var(--card-shadow) !important;
    color: var(--foreground) !important;
  }
  .leaflet-popup-content {
    margin: 0 !important;
    color: var(--foreground) !important;
  }
  .leaflet-popup-tip {
    background: var(--card-bg) !important;
    border: 1px solid var(--card-border) !important;
    border-top: none !important;
    border-radius: 0 0 1rem 1rem !important;
  }
  .leaflet-bar { border: 1px solid rgba(255,255,255,0.08) !important; border-radius: 0.75rem !important; box-shadow: 0 4px 14px rgba(0,0,0,0.5) !important; overflow: hidden; }
  .leaflet-control-zoom a {
    width: 44px !important;
    height: 44px !important;
    line-height: 42px !important;
    background: rgba(13,13,13,0.95) !important;
    color: rgba(255,255,255,0.8) !important;
    border-bottom: 1px solid rgba(255,255,255,0.08) !important;
    font-size: 20px !important;
    transition: color 0.2s ease, background 0.2s ease;
  }
  .leaflet-control-zoom a:last-child { border-bottom: none !important; }
  .leaflet-control-zoom a:hover { background: rgba(245,158,11,0.15) !important; color: #fbbf24 !important; }
  .leaflet-control-zoom a:focus-visible { outline: 2px solid #fcd34d; outline-offset: -2px; }
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
      <div className="relative h-[calc(100dvh-148px)] md:h-[calc(100dvh-60px)] min-h-0">
        {/* Mapa a toda a largura */}
        <div className="absolute inset-0">
          {loading ? (
            <div className="h-full bg-[var(--background-secondary)] flex items-center justify-center">
              <ToviLoader size="sm" />
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center gap-3" role="alert">
              <p className="text-red-400 text-sm">Erro ao carregar mapa: {error}</p>
              <button onClick={refetch} className={retryBtn}>Tentar novamente</button>
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

        {/* Pesquisa, Perto de mim e «sem localização» flutuantes */}
        <div className="absolute top-2 left-2 right-14 lg:left-[26rem] lg:right-16 z-[1001] flex flex-col gap-2 pointer-events-none [&>*]:pointer-events-auto">
          <div className="relative max-w-md">
            <input
              ref={searchRef}
              type="text"
              aria-label="Pesquisar restaurante"
              placeholder="Pesquisar restaurante... ( / )"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full min-h-[44px] pl-10 pr-10 rounded-full bg-[#0d0d0d]/95 backdrop-blur border border-white/[0.08] text-sm text-white/90 placeholder:text-white/40 ${focusRing}`}
            />
            <Ico name="search" className="absolute pointer-events-none left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Limpar pesquisa"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center text-white/50 hover:text-white/90"
              >
                <Ico name="x" className="h-4 w-4" />
              </button>
            )}
          </div>
          <NearbyBar
            active={nearbyActive}
            onToggle={() => { if (!nearbyActive) nearby.requestLocation(); setNearbyActive(v => !v); }}
            radius={nearbyRadius}
            onRadius={(r) => { setNearbyRadius(r); nearby.searchNearby({ radius: r }); }}
            loading={nearby.loading}
            error={nearby.error}
            locationError={nearby.locationError}
          />
          {restaurantsWithoutCoords.length > 0 && (
            <button
              onClick={() => setSheet(2)}
              className={`self-start inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-full text-[13px] bg-[#0d0d0d]/95 backdrop-blur border border-amber-500/30 text-amber-300 ${focusRing}`}
            >
              <Ico name="pin" className="h-4 w-4" />
              {restaurantsWithoutCoords.length} sem localização
            </button>
          )}
        </div>

        {/* Folha com 3 alturas (mobile) / cartão à esquerda (desktop) */}
        <section
          aria-label="Restaurantes no mapa"
          className={`absolute z-[1000] inset-x-0 bottom-0 ${sheetHeight} lg:inset-x-auto lg:left-4 lg:top-4 lg:bottom-4 lg:w-96 ${
            sheet === 0 ? "lg:h-14 lg:bottom-auto" : "lg:h-auto"
          } flex flex-col rounded-t-2xl lg:rounded-2xl bg-[#0d0d0d]/95 backdrop-blur border border-white/[0.08] shadow-2xl transition-[height] duration-200 motion-reduce:transition-none`}
        >
          <button
            onClick={() => setSheet((s) => ((s + 1) % 3) as Sheet)}
            aria-label="Alterar altura da lista"
            className={`flex items-center justify-between gap-3 px-4 min-h-[56px] flex-shrink-0 text-left rounded-t-2xl ${focusRing}`}
          >
            <span className="text-sm font-bold text-white/90">Restaurantes no Mapa</span>
            <span className="flex items-center gap-2">
              <span aria-live="polite" className="text-xs text-white/60 bg-white/[0.06] px-2.5 py-1 rounded-full">
                {mapRestaurants.length}
              </span>
              <Ico name="chevron" className={`h-4 w-4 text-white/60 transition-transform ${sheet === 2 ? "" : "rotate-180"}`} />
            </span>
          </button>

          {sheet > 0 && (
            <div ref={listRef} onKeyDown={onListKey} className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 space-y-1.5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
                ))
              ) : error ? (
                <div className="p-2" role="alert">
                  <p className="text-sm text-red-400 mb-2">Erro: {error}</p>
                  <button onClick={refetch} className={retryBtn}>Tentar novamente</button>
                </div>
              ) : nearbyStatus ? (
                <p className="text-sm text-white/60 p-2">{nearby.loading ? "A localizar..." : nearby.error}</p>
              ) : mapRestaurants.length === 0 ? (
                <p className="text-sm text-white/60 p-2">
                  {searchQuery ? "Nenhum resultado." : "Ainda não há restaurantes com localização."}
                </p>
              ) : (
                mapRestaurants.map((r) => (
                  <button
                    key={r.id}
                    data-item
                    style={{ contentVisibility: "auto", containIntrinsicSize: "auto 56px" }}
                    onClick={() => { setSelectedId(r.id); setSheet(1); }}
                    className={`w-full text-left flex items-center gap-3 p-3 min-h-[56px] rounded-xl border border-white/[0.06] hover:bg-white/[0.05] transition-colors group ${focusRing} ${
                      selectedId === r.id ? "ring-1 ring-amber-500/40 bg-amber-500/[0.06]" : "bg-white/[0.02]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbFor(r as RestaurantWithDetails)}
                      alt=""
                      loading="lazy"
                      onError={(e) => { const t = e.currentTarget; if (!t.src.includes("/mascot/")) t.src = toviFor(r.id); }}
                      className="w-12 h-12 rounded-lg bg-white/[0.04] flex-shrink-0 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white/90 truncate group-hover:text-amber-400 transition-colors">{r.name}</p>
                      <p className="text-xs text-white/50 truncate">{r.location || "Sem localização"}</p>
                    </div>
                    {r.rating != null && (
                      <span className="text-xs text-amber-400/80 ml-auto flex-shrink-0">★ {r.rating.toFixed(1)}</span>
                    )}
                  </button>
                ))
              )}
              {restaurantsWithoutCoords.length > 0 && (
                <p className="text-xs text-amber-400/80 pt-2 px-1">
                  {restaurantsWithoutCoords.length} restaurante(s) sem coordenadas —{" "}
                  <Link href="/restaurants/no-coords" className="underline font-medium text-amber-400">
                    ver lista completa
                  </Link>
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
