"use client";

import React, { useMemo, useEffect, useRef } from "react";
import { MAP_CSS } from "./mapStyles";
import { MapContainer, TileLayer, Marker, ZoomControl, useMap } from "react-leaflet";
import type { RestaurantWithDetails } from "@/libs/types";
import { thumbFor, toviFor } from "@/utils/restaurantThumb";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";

// Custom map pin — SVG da iconografia (pin garfo; pin estrela, maior, quando ativo)
// No image files; inline SVG + divIcon. Cores do acento âmbar da marca.
const PIN_PATH = "M32 5C19.8 5 11 14.4 11 26c0 14.5 21 33 21 33s21-18.5 21-33C53 14.4 44.2 5 32 5Z";

// Estado do pin: ativo (estrela, contorno), 4,5+ (estrela âmbar claro), sem avaliações (contorno), avaliado (garfo)
function createRestaurantIcon(active?: boolean, rating?: number | null): L.DivIcon {
  const top = rating != null && rating >= 4.5;
  const unrated = rating == null;
  const size = active ? 48 : 40;
  const body = active
    ? `<path d="${PIN_PATH}" fill="#050505" fill-opacity="0.55" stroke="#f59e0b" stroke-width="4.2" stroke-linejoin="round"/>
       <path d="M32 15.5 35.2 22.3 42.6 23.2 37.3 28.4 38.6 35.8 32 32.3 25.4 35.8 26.7 28.4 21.4 23.2 28.8 22.3Z" fill="#f59e0b" stroke="#f59e0b" stroke-width="1.6" stroke-linejoin="round"/>`
    : top
    ? `<path d="${PIN_PATH}" fill="#fbbf24"/>
       <path d="M32 15.5 35.2 22.3 42.6 23.2 37.3 28.4 38.6 35.8 32 32.3 25.4 35.8 26.7 28.4 21.4 23.2 28.8 22.3Z" fill="#050505" stroke="#050505" stroke-width="1.6" stroke-linejoin="round"/>`
    : unrated
    ? `<path d="${PIN_PATH}" fill="#050505" fill-opacity="0.7" stroke="#f59e0b" stroke-width="3.6" stroke-linejoin="round"/>
       <g stroke="#f59e0b" stroke-width="3.2" stroke-linecap="round" fill="none"><path d="M25.5 16.5v9M32 16.5v9M38.5 16.5v9"/><path d="M25.5 25.5a6.5 6.5 0 0 0 13 0"/><path d="M32 32v11"/></g>`
    : `<path d="${PIN_PATH}" fill="#f59e0b"/>
       <g stroke="#050505" stroke-width="3.2" stroke-linecap="round" fill="none"><path d="M25.5 16.5v9M32 16.5v9M38.5 16.5v9"/><path d="M25.5 25.5a6.5 6.5 0 0 0 13 0"/><path d="M32 32v11"/></g>`;
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;filter:drop-shadow(0 2px 5px rgba(0,0,0,0.55));transition:transform 0.2s ease;"><svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none">${body}</svg></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size * 0.92],
    popupAnchor: [0, -size * 0.92],
  });
}

// Aglomerado próprio: disco escuro com anel âmbar; tamanho cresce com a contagem
function createClusterIcon(cluster: { getChildCount: () => number }): L.DivIcon {
  const n = cluster.getChildCount();
  const size = n < 10 ? 40 : n < 100 ? 48 : n < 1000 ? 56 : 64;
  const label = n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:radial-gradient(circle at 50% 40%,#1a1a1a,#050505);border:2px solid #f59e0b;box-shadow:0 0 0 5px rgba(245,158,11,0.18),0 4px 12px rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;color:#fbbf24;font:700 ${size > 48 ? 15 : 13}px/1 system-ui,sans-serif;">${label}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// ponytail: 2000+ pins — icons are cached per variant, never rebuilt per marker/render
const iconCache = new Map<string, L.DivIcon>();
function getRestaurantIcon(active: boolean, rating?: number | null): L.DivIcon {
  const key = active ? "active" : rating == null ? "unrated" : rating >= 4.5 ? "top" : "rated";
  let icon = iconCache.get(key);
  if (!icon) {
    icon = createRestaurantIcon(active, rating);
    iconCache.set(key, icon);
  }
  return icon;
}

if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: "",
    iconRetinaUrl: "",
    shadowUrl: "",
  });
}

interface RestaurantMapProps {
  restaurants: RestaurantWithDetails[];
  className?: string;
  height?: string;
  center?: [number, number];
  zoom?: number;
  selectedId?: string | null;
  showPopup?: boolean;
  onSelect?: (id: string | null) => void;
  focusCenter?: [number, number] | null;
  focusZoom?: number;
  userLocation?: { lat: number; lng: number } | null;
}

function isValidCoords(r: RestaurantWithDetails): boolean {
  return (
    r.latitude != null &&
    r.longitude != null &&
    typeof r.latitude === "number" &&
    typeof r.longitude === "number" &&
    r.latitude >= -90 &&
    r.latitude <= 90 &&
    r.longitude >= -180 &&
    r.longitude <= 180
  );
}


function escapeHtml(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Conteúdo do popup (selecionado e hover): um só popup partilhado em vez de um por marcador
function buildPopupContent(r: RestaurantWithDetails): HTMLElement {
  const container = document.createElement("div");
  const stars = r.rating != null ? Math.round(r.rating) : 0;
  container.innerHTML = `
    <div class="fl-popup">
      <img class="fl-popup-img" src="${escapeHtml(thumbFor(r))}" alt="" onerror="if(!this.src.includes('/mascot/'))this.src='${toviFor(r.id)}'" />
      <div class="fl-popup-body">
        <h3 class="fl-popup-title">${escapeHtml(r.name)}</h3>
        ${r.rating != null
          ? `<p class="fl-popup-rating"><span aria-hidden="true">${"★".repeat(stars)}<i>${"★".repeat(5 - stars)}</i></span> ${r.rating.toFixed(1)}</p>`
          : `<p class="fl-popup-muted">Sem avaliações</p>`}
        ${r.location ? `<p class="fl-popup-muted">${escapeHtml(r.location)}</p>` : ""}
        <a href="/restaurants/${encodeURIComponent(r.slug || r.id)}" class="fl-popup-cta popup-cta">
          Explorar
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </div>`;
  return container;
}

// Marcador memoizado: só re-renderiza quando muda o próprio restaurante ou o estado ativo
const RestaurantMarker = React.memo(function RestaurantMarker({
  r, active, hoverBlocked, onSelect,
}: {
  r: RestaurantWithDetails;
  active: boolean;
  hoverBlocked: boolean;
  onSelect?: (id: string | null) => void;
}) {
  const handlers = useMemo(
    () => ({
      click: () => onSelect?.(r.id),
      mouseover: (e: L.LeafletMouseEvent) => {
        if (hoverBlocked) return;
        const m = e.target as L.Marker;
        m.setIcon(getRestaurantIcon(true, r.rating));
        const map = (m as unknown as { _map?: L.Map })._map;
        map?.openPopup(L.popup({ maxWidth: 260, minWidth: 240, closeButton: false, offset: [0, -36] }).setLatLng(m.getLatLng()).setContent(buildPopupContent(r)));
      },
      mouseout: (e: L.LeafletMouseEvent) => {
        const m = e.target as L.Marker;
        m.setIcon(getRestaurantIcon(active, r.rating));
        if (!hoverBlocked) (m as unknown as { _map?: L.Map })._map?.closePopup();
      },
    }),
    [r, active, hoverBlocked, onSelect]
  );
  return (
    <Marker
      position={[r.latitude!, r.longitude!]}
      icon={getRestaurantIcon(active, r.rating)}
      alt={r.rating == null ? `${r.name}, sem avaliações` : `${r.name}, ${r.rating.toFixed(1)} estrelas`}
      eventHandlers={handlers}
    />
  );
});

// Opens a popup programmatically when a restaurant is selected from the sidebar
function SelectedRestaurantPopup({ restaurant, onDeselect }: { restaurant: RestaurantWithDetails; onDeselect?: () => void }) {
  const map = useMap();
  useEffect(() => {
    if (!restaurant.latitude || !restaurant.longitude) return;
    const container = buildPopupContent(restaurant);
    const popup = L.popup({ maxWidth: 260, minWidth: 240 })
      .setLatLng([restaurant.latitude!, restaurant.longitude!])
      .setContent(container)
      .openOn(map);
    const onPopupClose = () => { onDeselect?.(); };
    map.on("popupclose", onPopupClose);
    return () => { map.off("popupclose", onPopupClose); map.closePopup(); };
  }, [restaurant, map]);
  return null;
}

// ponytail: distinct blue dot for the user's own position
function createUserPinIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="width:22px;height:22px;background:#3b82f6;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 6px rgba(59,130,246,0.25),0 2px 8px rgba(0,0,0,0.4);"></div>`,
    iconAnchor: [11, 11],
  });
}

// Zooms out when popup closes (selectedRestaurant goes from truthy to null)
function ZoomOutOnClose({ selectedRestaurant }: { selectedRestaurant: RestaurantWithDetails | null }) {
  const map = useMap();
  const prevRef = useRef(selectedRestaurant);
  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = selectedRestaurant;
    if (prev && !selectedRestaurant) {
      map.flyTo(map.getCenter(), Math.max(map.getZoom() - 2, 10), { duration: 1.5 });
    }
  }, [selectedRestaurant, map]);
  return null;
}


// Reset zoom button — returns map to city-level zoom (10)
function ResetZoomButton() {
  const map = useMap();
  return (
    <div className="absolute top-[108px] right-[10px] z-[1000]">
      <button
        onClick={() => { map.flyTo(map.getCenter(), 10, { duration: 1.5 }); }}
        className="w-11 h-11 rounded-xl bg-black/80 border border-white/10 flex items-center justify-center text-white/70 hover:text-amber-400 hover:bg-black transition-colors shadow-lg"
        title="Reset zoom"
        aria-label="Reset map zoom"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
      </button>
    </div>
  );
}

// Component that flies map to selected restaurant
// Fly map to a desired center when it changes (nearby search)
function FlyToFocus({ center, zoom }: { center: [number, number] | null; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

function FlyToMarker({ restaurant }: { restaurant: RestaurantWithDetails }) {
  const map = useMap();
  useEffect(() => {
    if (restaurant.latitude && restaurant.longitude) {
      map.flyTo([restaurant.latitude!, restaurant.longitude!], 16, { duration: 1.5 });
    }
  }, [restaurant, map]);
  return null;
}


// Fix: recalculate map size after CSS is applied (prevents black tiles on init)
function MapResize() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 500);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// Enquadra todos os restaurantes na abertura (padding para controlos e barra inferior)
function FitToMarkers({ markers }: { markers: RestaurantWithDetails[] }) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (done.current || markers.length === 0) return;
    done.current = true;
    const bounds = L.latLngBounds(markers.map((r) => [r.latitude!, r.longitude!] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
  }, [markers, map]);
  return null;
}

export default function RestaurantMap({
  restaurants,
  className = "",
  height = "h-full",
  center = [39.4, -8.3],
  zoom = 10,
  selectedId,
  showPopup = true,
  onSelect,
  focusCenter,
  focusZoom = 13,
  userLocation,
}: RestaurantMapProps) {
  const markers = useMemo(
    () => restaurants.filter(isValidCoords),
    [restaurants]
  );

  const selectedRestaurant = useMemo(
    () => markers.find((r) => r.id === selectedId) ?? null,
    [markers, selectedId]
  );

  return (
    <div className={`relative w-full ${height} ${className}`} style={{ minHeight: "300px" }}>
        <style>{MAP_CSS}</style>
        {/* Skeleton overlay — shown until TileLayer renders */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/[0.02] rounded-xl z-[1] pointer-events-none animate-pulse">
          <div className="w-full h-full bg-gradient-to-b from-transparent via-white/[0.03] to-transparent" />
        </div>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full rounded-xl"
        zoomControl={false}
      >

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {selectedRestaurant && <FlyToMarker restaurant={selectedRestaurant} />}
        <FlyToFocus center={focusCenter ?? null} zoom={focusZoom} />
      <ZoomOutOnClose selectedRestaurant={selectedRestaurant} />
                <ResetZoomButton />
        {showPopup && selectedRestaurant && <SelectedRestaurantPopup restaurant={selectedRestaurant} onDeselect={() => onSelect?.(null)} />}
        <ZoomControl position="topright" />
        <FitToMarkers markers={markers} />
        <MapResize />
        {userLocation?.lat != null && userLocation?.lng != null && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserPinIcon()} />
        )}
        <MarkerClusterGroup chunkedLoading maxClusterRadius={60} iconCreateFunction={createClusterIcon}>
        {markers.map((r) => (
          <RestaurantMarker key={r.id} r={r} active={selectedId === r.id} hoverBlocked={!!selectedId} onSelect={onSelect} />
        ))}
        </MarkerClusterGroup>
      </MapContainer>
      {markers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--background-secondary)] rounded-xl">
          <p className="text-white/30 text-sm">
            Nenhum restaurante com coordenadas para mostrar.
          </p>
        </div>
      )}
    </div>
  );
}
