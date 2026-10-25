'use client';

import { TooltipFast } from "@/components/ui/Tooltip";
import Ico from "@/components/ui/icons/Ico";

const RADII = [2, 5, 10, 25, 50, 100];

const chip =
  "inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-full text-[13px] border backdrop-blur transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300";
const chipOff = "bg-[#0d0d0d]/95 border-white/[0.08] text-white/80 hover:bg-white/[0.08]";
const chipOn = "bg-amber-500/15 border-amber-500/50 text-amber-300";

// ponytail: presentational only — the hook lives in the page (single instance),
// passed down. A second instance here would create orphan state (userLocation
// set in the bar, grid reading the page's null location -> no results).
export default function NearbyBar({
  active, onToggle, radius, onRadius,
  loading, error, locationError,
}: {
  active: boolean;
  onToggle: () => void;
  radius: number;
  onRadius: (r: number) => void;
  loading?: boolean;
  error?: string | null;
  locationError?: string | null;
}) {

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <TooltipFast content="Mostrar restaurantes perto de mim">
        <button
          onClick={onToggle}
          aria-pressed={active}
          className={`${chip} ${active ? chipOn : chipOff}`}
          aria-label="Mostrar restaurantes perto de mim"
        >
          <Ico name="locate" className="h-4 w-4" />
          Perto de mim
          {active && <Ico name="x" className="h-3 w-3 opacity-60" />}
        </button>
      </TooltipFast>

      {active && (
        <div role="group" aria-label="Raio de pesquisa" className="flex flex-wrap gap-1.5 basis-full">
          {RADII.map((r) => (
            <button
              key={r}
              onClick={() => onRadius(r)}
              aria-pressed={radius === r}
              className={`${chip} ${radius === r ? chipOn : chipOff}`}
            >
              {r} km
            </button>
          ))}
        </div>
      )}

      {(loading || (active && (error || locationError))) && (
        <span className="text-xs text-white/60 basis-full" role="status">
          {loading ? 'A localizar...' : (locationError || error)}
        </span>
      )}
    </div>
  );
}
