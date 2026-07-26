"use client";

import React, { useMemo, useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { RestaurantWithDetails } from "@/libs/types";
import Link from "next/link";
import L from "leaflet";

// Custom map pin — SVG teardrop with optional letter init
// No image files; fully themed via inline SVG + divIcon
// active=true inverts colors (amber fill, dark stroke) to highlight selected/hovered pin
function createRestaurantIcon(letter?: string, active?: boolean): L.DivIcon {
  const fill = active ? "#fbbf24" : "#050505";
  const stroke = active ? "#050505" : "#fbbf24";
  const letterFill = active ? "#050505" : "#fbbf24";
  const letterSvg = letter
    ? `<text x="16" y="21" text-anchor="middle" fill="${letterFill}" font-size="12" font-weight="700" font-family="system-ui">${letter}</text>`
    : "";
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 36px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));
      transition: transform 0.2s ease;
    "><svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40" fill="none">
      <path d="M16 0C7.16 0 0 7.16 0 16c0 10.5 16 24 16 24s16-13.5 16-24C32 7.16 24.84 0 16 0z" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <circle cx="16" cy="15" r="8" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <text x="16" y="15" text-anchor="middle" dominant-baseline="central" fill="${letterFill}" font-size="14" font-weight="700" font-family="system-ui">${letter}</text>
    </svg></div>`,
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    popupAnchor: [0, -42],
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
        <a href="/restaurants/${restaurant.id}" class="mt-2 inline-flex items-center gap-1.5 text-xs font-medium popup-cta" style="color:#fbbf24;text-decoration:none;transition:color 0.2s ease,gap 0.2s ease;">
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

// Geolocation button — centers map on user location
function GeolocateButton() {
  const map = useMap();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="absolute top-3 right-3 z-[1000]">
      <button
        onClick={() => {
          if (!navigator.geolocation) { setError("Geolocation not supported"); return; }
          setError(null);
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              map.flyTo([pos.coords.latitude, pos.coords.longitude], 13, { duration: 1.5 });
            },
            (err) => setError(err.message || "Geolocation failed"),
            { enableHighAccuracy: true, timeout: 5000 }
          );
        }}
        className="w-10 h-10 rounded-xl bg-black/80 border border-white/10 flex items-center justify-center text-white/70 hover:text-amber-400 hover:bg-black transition-colors shadow-lg"
        title="My location"
        aria-label="Find my location"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/></svg>
      </button>
      {error && (
        <p className="text-xs text-red-400 mt-1 text-right">{error}</p>
      )}
    </div>
  );
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
    <div className="absolute top-3 right-16 z-[1000]">
      <button
        onClick={() => { map.flyTo(map.getCenter(), 10, { duration: 1.5 }); }}
        className="w-10 h-10 rounded-xl bg-black/80 border border-white/10 flex items-center justify-center text-white/70 hover:text-amber-400 hover:bg-black transition-colors shadow-lg"
        title="Reset zoom"
        aria-label="Reset map zoom"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
      </button>
    </div>
  );
}

// Component that flies map to selected restaurant
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

export default function RestaurantMap({
  restaurants,
  className = "",
  height = "h-full",
  center = [39.4, -8.3],
  zoom = 10,
  selectedId,
  showPopup = true,
  onSelect,
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
        zoomControl={true}
      >

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {selectedRestaurant && <FlyToMarker restaurant={selectedRestaurant} />}
      <ZoomOutOnClose selectedRestaurant={selectedRestaurant} />
                {selectedRestaurant && <GeolocateButton />}
        <ResetZoomButton />
        {showPopup && selectedRestaurant && <SelectedRestaurantPopup restaurant={selectedRestaurant} onDeselect={() => onSelect?.(null)} />}
        <MapResize />
        {markers.map((r) => (
          <Marker key={r.id} position={[r.latitude!, r.longitude!]} icon={createRestaurantIcon(r.name[0].toUpperCase(), selectedId === r.id)} eventHandlers={{ click: () => onSelect?.(r.id), mouseover: (e) => { if (selectedId) return; e.target.setIcon(createRestaurantIcon(r.name[0].toUpperCase(), true)); e.target.openPopup(); }, mouseout: (e) => { e.target.setIcon(createRestaurantIcon(r.name[0].toUpperCase(), selectedId === r.id)); e.target.closePopup(); } }}>
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
                  href={`/restaurants/${r.id}`}
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
