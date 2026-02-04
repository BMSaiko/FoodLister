// components/ui/RestaurantCard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { getDescriptionPreview } from '@/utils/formatters';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts';
import RestaurantCardHeader from './RestaurantCardHeader';
import RestaurantCardCategories from './RestaurantCardCategories';
import RestaurantCardFooter from './RestaurantCardFooter';
import RestaurantCardActions from './RestaurantCardActions';
import { RestaurantWithDetails, VisitData } from '@/libs/types';

interface RestaurantCardProps {
  restaurant: RestaurantWithDetails;
  centered?: boolean;
  visitsData?: VisitData | null;
  loadingVisits?: boolean;
  onVisitsDataUpdate?: (restaurantId: string, data: { visited: boolean; visit_count: number }) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ 
  restaurant, 
  centered = false, 
  visitsData = null, 
  loadingVisits = false, 
  onVisitsDataUpdate = null 
}) => {
  const { user, getAccessToken } = useAuth();
  const [visited, setVisited] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Update visited state when visitsData changes or component mounts
  useEffect(() => {
    if (visitsData !== null && visitsData !== undefined) {
      const newVisited = visitsData.visited || false;
      setVisited(newVisited);
    } else {
      setVisited(false);
    }
  }, [visitsData, restaurant.id]);

  const handleToggleVisited = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsUpdating(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`/api/restaurants/${restaurant.id}/visits`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'toggle_visited' }),
      });

      if (!response.ok) {
        throw new Error('Failed to update visit status');
      }

      const data = await response.json();
      setVisited(data.visited);

      // Notify parent component to update visits data
      if (onVisitsDataUpdate) {
        onVisitsDataUpdate(restaurant.id, {
          visited: data.visited,
          visit_count: data.visit_count
        });
      }

      // Show success toast
      toast.success(
        data.visited
          ? 'Restaurante marcado como visitado!'
          : 'Restaurante marcado como não visitado!',
        {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
          className: "text-sm sm:text-base"
        }
      );
    } catch (err) {
      console.error('Erro ao atualizar status de visitado:', err);

      // Show error toast
      toast.error('Erro ao atualizar status de visita. Tente novamente.', {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        className: "text-sm sm:text-base"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCardClick = () => {
    // Save restaurant ID for scroll targeting after navigation
    if (restaurant.id) {
      sessionStorage.setItem('targetRestaurantId', restaurant.id);
    }
    // Also save scroll position as fallback
    sessionStorage.setItem('restaurantsScrollPosition', String(window.scrollY));
  };

  return (
    <Link href={`/restaurants/${restaurant.id}`} className={centered ? "block w-full" : ""} onClick={handleCardClick}>
      <div className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg h-full w-full flex flex-col ${centered ? 'min-w-[280px] sm:min-w-[320px]' : 'min-w-[280px] max-w-[365px] sm:max-w-[500px] lg:max-w-[600px]'}`}>
        {/* Header with Image and Actions */}
        <div className="relative">
          <RestaurantCardHeader restaurant={restaurant} centered={centered} />
          {user && (
            <RestaurantCardActions
              restaurant={restaurant}
              visited={visited}
              isUpdating={isUpdating}
              loadingVisits={loadingVisits}
              onToggleVisited={handleToggleVisited}
              onVisitsDataUpdate={onVisitsDataUpdate || undefined}
            />
          )}
        </div>

        {/* Content Area */}
        <div className={`p-3 sm:p-4 flex-grow ${centered ? 'text-center' : ''}`}>
          <div className={`flex ${centered ? 'flex-col items-center gap-2' : 'justify-between items-start'}`}>
            <h3 className={`font-bold text-base sm:text-lg text-gray-800 line-clamp-1 ${centered ? 'text-center' : ''}`}>
              {restaurant.name}
            </h3>
          </div>
          

          {/* Categories Section */}
          <RestaurantCardCategories restaurant={restaurant} centered={centered} />

          {/* Footer Content */}
          <RestaurantCardFooter restaurant={restaurant} centered={centered} />
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
