// components/ui/RestaurantCardActions.tsx
"use client";

import React from 'react';
import { Check, X, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts';
import { useModal } from '@/contexts/ModalContext';

interface RestaurantCardActionsProps {
  restaurant: {
    id: string;
    location?: string;
    latitude?: number;
    longitude?: number;
  };
  visited: boolean;
  isUpdating: boolean;
  loadingVisits: boolean;
  onToggleVisited: (e: React.MouseEvent) => void;
  onVisitsDataUpdate?: (restaurantId: string, data: { visited: boolean; visit_count: number }) => void;
}

const RestaurantCardActions: React.FC<RestaurantCardActionsProps> = ({ 
  restaurant, 
  visited, 
  isUpdating, 
  loadingVisits, 
  onToggleVisited,
  onVisitsDataUpdate 
}) => {
  const { user } = useAuth();
  const { openMapModal } = useModal();

  const handleOpenMapModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only open map modal if location data is available
    if (restaurant.location || (restaurant.latitude && restaurant.longitude)) {
      openMapModal({
        location: restaurant.location || '',
        latitude: restaurant.latitude,
        longitude: restaurant.longitude
      });
    }
  };

  return (
    <div className="absolute top-3 right-3 flex flex-col gap-2">
      {/* Map Button - Available for all users */}
      {restaurant.location && (
        <button
          onClick={handleOpenMapModal}
          className="bg-primary hover:bg-primary-hover p-2 rounded-full shadow-md transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-1"
          title="Abrir mapa"
        >
          <MapPin className="h-4 w-4 text-[var(--primary-foreground)]" />
          <span className="text-xs font-medium hidden sm:inline text-[var(--primary-foreground)]">Mapa</span>
        </button>
      )}

      {/* Switch Button for visited/not visited status - only for authenticated users */}
      {user && (
        <button
          onClick={onToggleVisited}
          disabled={isUpdating || loadingVisits}
          className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
            loadingVisits
              ? 'bg-gray-200 text-gray-500 animate-pulse'
              : visited
              ? 'hover:bg-[#059669]'
              : 'hover:bg-[#6b7280]'
          }`}
          style={{
            backgroundColor: loadingVisits ? '#e5e7eb' : visited ? '#10b981' : '#9ca3af',
            color: loadingVisits ? '#6b7280' : visited ? '#ffffff' : '#000000'
          }}
          title={
            loadingVisits
              ? 'Carregando status de visita...'
              : visited
              ? 'Clique para marcar como não visitado'
              : 'Clique para marcar como visitado'
          }
        >
          {loadingVisits ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-[var(--gray-400)] border-t-transparent animate-spin" />
              <span className="text-xs font-medium hidden sm:inline">Carregando</span>
            </>
          ) : visited ? (
            <>
              <Check className="h-4 w-4" />
              <span className="text-xs font-medium hidden sm:inline">Visitado</span>
            </>
          ) : (
            <>
              <X className="h-4 w-4" />
              <span className="text-xs font-medium hidden sm:inline">Não visitado</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default RestaurantCardActions;
