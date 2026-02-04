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
  const { openMapModal } = useModal();

  const handleOpenMapModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    openMapModal({
      location: restaurant.location || '',
      latitude: restaurant.latitude,
      longitude: restaurant.longitude
    });
  };

  return (
    <div className="absolute top-3 right-3 flex flex-col gap-2">
      {/* Map Button */}
      {restaurant.location && (
        <button
          onClick={handleOpenMapModal}
          className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-md transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-1"
          title="Abrir mapa"
        >
          <MapPin className="h-4 w-4 text-gray-600" />
          <span className="text-xs font-medium hidden sm:inline text-gray-600">Mapa</span>
        </button>
      )}

      {/* Switch Button for visited/not visited status - only for authenticated users */}
      <button
        onClick={onToggleVisited}
        disabled={isUpdating || loadingVisits}
        className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
          loadingVisits
            ? 'bg-gray-200 text-gray-400 animate-pulse'
            : visited
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
        }`}
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
            <div className="h-4 w-4 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
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
    </div>
  );
};

export default RestaurantCardActions;
