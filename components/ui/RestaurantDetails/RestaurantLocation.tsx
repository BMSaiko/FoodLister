'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import DirectionsModal from './DirectionsModal';
import type { RestaurantDetail } from '@/hooks/restaurants/useRestaurantDetail';

const RestaurantMap = dynamic(() => import('@/components/ui/RestaurantMap/RestaurantMap'), { ssr: false });

/** Secção «Localização»: mapa com botão «Como chegar» (abre o DirectionsModal) ou só a morada. */
export default function RestaurantLocation({ restaurant }: { restaurant: RestaurantDetail }) {
  const [open, setOpen] = useState(false);
  const { latitude, longitude, location, name } = restaurant;
  const hasCoords = latitude != null && longitude != null;
  if (!hasCoords && !location) return null;

  const H = 'text-[11px] font-medium uppercase tracking-[0.14em] text-white/45';
  return (
    <section id="localizacao" className="scroll-mt-20 mt-11">
      <h2 className={H + ' mb-4'}>Localização</h2>
      {hasCoords && (
        <div className="relative h-60 isolate rounded-2xl border border-white/[0.08] overflow-hidden bg-[#0c0c0c]">
          <RestaurantMap
            restaurants={[restaurant as unknown as import('@/libs/types').RestaurantWithDetails]}
            height="h-full"
            selectedId={restaurant.id}
            showPopup={false}
          />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="absolute right-3 bottom-2.5 z-[500] inline-flex items-center gap-2 min-h-[40px] px-3.5 rounded-full bg-amber-500 text-[#111] text-[13px] font-semibold hover:bg-amber-400 transition-colors"
          >
            Como chegar →
          </button>
          <DirectionsModal
            isOpen={open}
            onClose={() => setOpen(false)}
            place={{ name, location, latitude: latitude!, longitude: longitude! }}
          />
        </div>
      )}
      {location && <p className="mt-3 text-sm text-white/70">{location}</p>}
    </section>
  );
}
