"use client";

import React, { useMemo, useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from "react-leaflet";
import type { RestaurantWithDetails } from "@/libs/types";
import Link from "next/link";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";

// Custom map pin — SVG da iconografia (pin garfo; pin estrela, maior, quando ativo)
// No image files; inline SVG + divIcon. Cores do acento âmbar da marca.
const PIN_PATH = "M32 5C19.8 5 11 14.4 11 26c0 14.5 21 33 21 33s21-18.5 21-33C53 14.4 44.2 5 32 5Z";

function createRestaurantIcon(active?: boolean): L.DivIcon {
  const size = active ? 48 : 40;
  const body = active
    ? `<path d="${PIN_PATH}" fill="#050505" fill-opacity="0.55" stroke="#f59e0b" stroke-width="4.2" stroke-linejoin="round"/>
       <path d="M32 15.5 35.2 22.3 42.6 23.2 37.3 28.4 38.6 35.8 32 32.3 25.4 35.8 26.7 28.4 21.4 23.2 28.8 22.3Z" fill="#f59e0b" stroke="#f59e0b" stroke-width="1.6" stroke-linejoin="round"/>`
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


// Opens a popup programmatically when a restaurant is selected from the sidebar
function SelectedRestaurantPopup({ restaurant, onDeselect }: { restaurant: RestaurantWithDetails; onDeselect?: () => void }) {
  const map = useMap();
  useEffect(() => {
    if (!restaurant.latitude || !restaurant.longitude) return;
    const container = document.createElement("div");
    container.innerHTML = `
      <div class="p-2 min-w-[180px]">
        <h3 class="font-semibold text-sm">${restaurant.name}</h3>
        ${restaurant.rating != null ? `<p className="text-xs text-white/60 mt-0.5">${"★".repeat(Math.round(restaurant.rating))} ${restaurant.rating.toFixed(1)}</p>` : ""}
        ${restaurant.location ? `<p className="text-xs text-white/40 mt-0.5">${restaurant.location}</p>` : ""}
        <a href="/restaurants/${restaurant.slug || restaurant.id}" class="mt-2 inline-flex items-center gap-1.5 text-xs font-medium popup-cta" style="color:#fbbf24;text-decoration:none;transition:color 0.2s ease,gap 0.2s ease;">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
          Explorar
        </a>
      </div>
    `;
    const popup = L.popup({ maxWidth: 250 })
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
        <MarkerClusterGroup chunkedLoading>
        {markers.map((r) => (
          <Marker key={r.id} position={[r.latitude!, r.longitude!]} icon={createRestaurantIcon(selectedId === r.id)} eventHandlers={{ click: () => onSelect?.(r.id), mouseover: (e) => { if (selectedId) return; e.target.setIcon(createRestaurantIcon(true)); e.target.openPopup(); }, mouseout: (e) => { e.target.setIcon(createRestaurantIcon(selectedId === r.id)); e.target.closePopup(); } }}>
            <Popup>
              <div className="p-2 min-w-[180px]">
                <h3 className="font-semibold text-sm">
                  {r.name}
                </h3>
                {r.rating != null && (
                  <p className="text-xs text-white/60 mt-0.5">
                    {"★".repeat(Math.round(r.rating))} {r.rating.toFixed(1)}
                  </p>
                )}
                {r.location && (
                  <p className="text-xs text-white/40 mt-0.5">
                    {r.location}
                  </p>
                )}
                <Link
                  href={`/restaurants/${r.slug || r.id}`}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium popup-cta"
                  style={{ color: '#fbbf24', transition: 'color 0.2s ease, gap 0.2s ease' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                  Explorar
                </Link>
              </div>
            </Popup>
          </Marker>
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
