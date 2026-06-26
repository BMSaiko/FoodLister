"use client";

import React from "react";
import { MapPin } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts";
import { useModal } from "@/contexts/ModalContext";

interface RestaurantCardActionsProps {
  restaurant: {
    id: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    source_url?: string;
  };
  visited: boolean;
  isUpdating: boolean;
  onToggleVisited: (e: React.MouseEvent) => void;
}

const RestaurantCardActions: React.FC<RestaurantCardActionsProps> = ({
  restaurant,
  visited,
  isUpdating,
  onToggleVisited,
}) => {
  const { user } = useAuth();
  const { openMapModal } = useModal();

  const handleOpenMapModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (restaurant.location || (restaurant.latitude && restaurant.longitude)) {
      openMapModal({ location: restaurant.location || "", latitude: restaurant.latitude, longitude: restaurant.longitude, source_url: restaurant.source_url });
    } else {
      toast.error("Localização não disponível para este restaurante.");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {user && (
        <button
          onClick={onToggleVisited}
          className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
            visited
              ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
              : "bg-white/[0.03] text-[var(--foreground-secondary)] hover:bg-white/[0.06] border border-white/[0.08]"
          }`}
          title={
            isUpdating
              ? "Carregando..."
              : visited
              ? "Clique para marcar como não visitado"
              : "Clique para marcar como visitado"
          }
        >
          {isUpdating ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-[var(--gray-400)] border-t-transparent animate-spin" />
              <span className="text-xs font-medium hidden sm:inline">Carregando</span>
            </>
          ) : visited ? (
            <>
              <span className="text-xs font-medium hidden sm:inline">Visitado</span>
            </>
          ) : (
            <>
              <span className="text-xs font-medium hidden sm:inline">Não visitado</span>
            </>
          )}
        </button>
      )}

      {restaurant.location && (
        <button
          onClick={handleOpenMapModal}
          className="px-3 py-1.5 rounded-full bg-white/[0.03] text-[var(--foreground-secondary)] hover:bg-white/[0.06] border border-white/[0.08] flex items-center gap-1.5 cursor-pointer transition-all"
          title="Ver no mapa"
        >
          <MapPin className="h-4 w-4" />
          <span className="text-xs font-medium hidden sm:inline">Mapa</span>
        </button>
      )}
    </div>
  );
};

export default RestaurantCardActions;
