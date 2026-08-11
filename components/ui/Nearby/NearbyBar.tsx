'use client';

import { MapPin, X } from 'lucide-react';
import { useNearbyRestaurants } from '@/hooks/restaurants/useNearbyRestaurants';

// ponytail: one shared bar for both /restaurants and /map. Backend (/nearby)
// + hook already exist; this is only the UI wiring.
export default function NearbyBar({
  active, onToggle, radius, onRadius,
}: {
  active: boolean;
  onToggle: () => void;
  radius: number;
  onRadius: (r: number) => void;
}) {
  const { loading, error, locationError, requestLocation } = useNearbyRestaurants();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => { if (!active) requestLocation(); onToggle(); }}
        className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
          active
            ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'
            : 'bg-white/5 text-white/70 ring-1 ring-white/10 hover:bg-white/10'
        }`}
        title="Mostrar restaurantes perto de mim"
      >
        <MapPin className="h-4 w-4" />
        Perto de mim
        {active && <X className="h-3 w-3 opacity-60" />}
      </button>

      {active && (
        <select
          value={radius}
          onChange={(e) => onRadius(Number(e.target.value))}
          className="px-2 py-2 rounded-full text-xs bg-white/5 ring-1 ring-white/10 text-white/70"
          aria-label="Raio de pesquisa"
        >
          {[2, 5, 10, 25].map((r) => (
            <option key={r} value={r}>{r} km</option>
          ))}
        </select>
      )}

      {(loading || (active && (error || locationError))) && (
        <span className="text-xs text-white/40">
          {loading ? 'A localizar...' : (locationError || error)}
        </span>
      )}
    </div>
  );
}
