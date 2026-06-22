import React from "react";
import { Star, Euro, MapPin, Calendar, Filter, RefreshCw } from "lucide-react";

interface ListMetaBarProps {
  restaurantCount: number;
  avgRating?: number;
  avgPrice?: number;
  uniqueLocations?: number;
  createdAt: string;
  hasFilters: boolean;
  applyingFilters: boolean;
  onApplyFilters: () => void;
}

export default function ListMetaBar({
  restaurantCount, avgRating, avgPrice, uniqueLocations, createdAt, hasFilters, applyingFilters, onApplyFilters
}: ListMetaBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
      <div className="flex items-center gap-2">
        <div className="bg-amber-500/10 rounded-lg p-1.5"><Star className="h-4 w-4 text-amber-400" /></div>
        <div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider font-medium">Rating</div>
          <div className="text-sm font-semibold text-white/85">{avgRating ? avgRating.toFixed(1) : "—"}</div>
        </div>
      </div>

      <div className="w-px h-8 bg-white/[0.06] hidden md:block" />

      <div className="flex items-center gap-2">
        <div className="bg-orange-500/10 rounded-lg p-1.5"><Euro className="h-4 w-4 text-orange-400" /></div>
        <div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider font-medium">Preco medio</div>
          <div className="text-sm font-semibold text-white/85">{avgPrice ? "€" + avgPrice.toFixed(0) : "—"}</div>
        </div>
      </div>

      <div className="w-px h-8 bg-white/[0.06] hidden md:block" />

      <div className="flex items-center gap-2">
        <div className="bg-emerald-500/10 rounded-lg p-1.5"><MapPin className="h-4 w-4 text-emerald-400" /></div>
        <div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider font-medium">Locais</div>
          <div className="text-sm font-semibold text-white/85">{uniqueLocations ?? "—"}</div>
        </div>
      </div>

      <div className="w-px h-8 bg-white/[0.06] hidden md:block" />

      <div className="flex items-center gap-2">
        <div className="bg-blue-500/10 rounded-lg p-1.5"><Calendar className="h-4 w-4 text-blue-400" /></div>
        <div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider font-medium">Criada</div>
          <div className="text-sm font-semibold text-white/85">{new Date(createdAt).toLocaleDateString("pt-PT")}</div>
        </div>
      </div>

      {hasFilters && (
        <>
          <div className="w-px h-8 bg-white/[0.06] hidden md:block" />
          <button
            onClick={onApplyFilters}
            disabled={applyingFilters}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-all duration-150 disabled:opacity-50"
          >
            {applyingFilters ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Filter className="h-3 w-3" />}
            <span>Aplicar filtros</span>
          </button>
        </>
      )}
    </div>
  );
}
