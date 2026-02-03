// components/ui/RestaurantCard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Check, X, MapPin, Euro, Tag } from 'lucide-react';
import { convertCloudinaryUrl } from '@/utils/cloudinaryConverter';
import { createClient } from '@/libs/supabase/client';
import { getDescriptionPreview } from '@/utils/formatters';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts';
import RestaurantImagePlaceholder from './RestaurantImagePlaceholder';
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
  // Determine display image: use carousel display image if available, fallback to legacy image_url
  const getDisplayImage = () => {
    // If restaurant has images array and display_image_index is valid
    if (restaurant.images && restaurant.images.length > 0) {
      if (restaurant.display_image_index !== undefined && 
          restaurant.display_image_index >= 0 &&
          restaurant.display_image_index < restaurant.images.length) {
        // Use the specified display image
        return convertCloudinaryUrl(restaurant.images[restaurant.display_image_index]);
      } else if (restaurant.images.length > 0) {
        // Use first image as fallback
        return convertCloudinaryUrl(restaurant.images[0]);
      }
    }
    // Fallback to legacy image_url
    return convertCloudinaryUrl(restaurant.image_url || '');
  };

  const imageUrl = getDisplayImage();
  const hasImage = imageUrl && imageUrl !== '/placeholder-restaurant.jpg' && imageUrl !== '';
  // Function to render prices with € icons
  const renderPriceCategory = (price: number) => {
    if (price <= 10) return { label: 'Econômico', level: 1 };
    if (price <= 20) return { label: 'Moderado', level: 2 };
    if (price <= 50) return { label: 'Elevado', level: 3 };
    return { label: 'Luxo', level: 4 };
  };

  // Get color class based on price level
  const getPriceColorClass = (level: number) => {
    // Classes para os ícones - variação de cores mantendo legibilidade
    switch(level) {
      case 1: return 'text-amber-400';
      case 2: return 'text-amber-500';
      case 3: return 'text-amber-600';
      case 4: return 'text-amber-800';
      default: return 'text-amber-400';
    }
  };
  
  // Classe para o texto do label - garantindo melhor legibilidade
  const getPriceLabelClass = (level: number) => {
    switch(level) {
      case 1: return 'text-amber-400 font-bold';
      case 2: return 'text-amber-500 font-bold';
      case 3: return 'text-amber-600 font-bold';
      case 4: return 'text-amber-800 font-bold';
      default: return 'text-amber-400 font-medium';
    }
  };

  const priceCategory = renderPriceCategory(restaurant.price_per_person || 0);
  const priceColorClass = getPriceColorClass(priceCategory.level);
  
  // Style of rating based on value
  const getRatingStyle = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-100 text-green-700';
    if (rating >= 3.5) return 'bg-amber-100 text-amber-700';
    if (rating >= 2.5) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };
  
  const ratingStyle = getRatingStyle(restaurant.rating || 0);

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
      <div className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg h-full w-full flex flex-col ${centered ? 'min-w-[280px] sm:min-w-[320px]' : ''}`}>
        <div className={`relative h-40 sm:h-48 w-full min-h-[160px] sm:min-h-[192px] ${centered ? 'min-w-full' : ''}`}>
          {hasImage ? (
            <Image
              src={imageUrl}
              alt={restaurant.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              style={{
                minWidth: '100%',
                minHeight: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          ) : (
            <RestaurantImagePlaceholder />
          )}

          {/* Switch Button for visited/not visited status - only for authenticated users */}
          {user && (
            <button
              onClick={handleToggleVisited}
              disabled={isUpdating || loadingVisits}
              className={`absolute top-3 right-3 px-3 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
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
          )}
        </div>
        <div className={`p-3 sm:p-4 flex-grow ${centered ? 'text-center' : ''}`}>
          <div className={`flex ${centered ? 'flex-col items-center gap-2' : 'justify-between items-start'}`}>
            <h3 className={`font-bold text-base sm:text-lg text-gray-800 line-clamp-1 ${centered ? 'text-center' : ''}`}>{restaurant.name}</h3>
            <div className={`flex items-center ${ratingStyle} px-2 py-1 rounded ${centered ? '' : 'ml-2'} flex-shrink-0`}>
              <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="currentColor" />
              <span className="font-semibold text-sm">{(restaurant.rating || 0).toFixed(1)}</span>
            </div>
          </div>
          
          {/* Mostrar categorias se disponíveis */}
          {restaurant.cuisine_types && restaurant.cuisine_types.length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-2 ${centered ? 'justify-center' : ''}`}>
              {restaurant.cuisine_types.map(type => (
                <span key={type.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800">
                  <Tag className="h-3 w-3 mr-1" />
                  {type.name}
                </span>
              ))}
            </div>
          )}

          {/* Mostrar opções dietéticas se disponíveis */}
          {restaurant.dietary_options && restaurant.dietary_options.length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-1 ${centered ? 'justify-center' : ''}`}>
              {restaurant.dietary_options.slice(0, 3).map(option => (
                <span key={option.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                  <span className="mr-1 text-sm">{option.icon || '🥗'}</span>
                  {option.name}
                </span>
              ))}
              {restaurant.dietary_options.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                  +{restaurant.dietary_options.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Mostrar recursos se disponíveis */}
          {restaurant.features && restaurant.features.length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-1 ${centered ? 'justify-center' : ''}`}>
              {restaurant.features.slice(0, 3).map(feature => (
                <span key={feature.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800" title={feature.description}>
                  <span className="mr-1 text-sm">{feature.icon || '⭐'}</span>
                  {feature.name}
                </span>
              ))}
              {restaurant.features.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                  +{restaurant.features.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Display reviews and rating - always visible if there are reviews */}
          {restaurant.review_count !== undefined && restaurant.review_count > 0 && (
            <div className={`mt-3 p-2 bg-gray-50 rounded-lg border border-gray-100 ${centered ? 'text-center' : ''}`}>
              <div className={`flex items-center ${centered ? 'justify-center flex-col gap-1' : 'justify-between'}`}>
                <div className="flex items-center gap-1">
                  {Array(5).fill(0).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(restaurant.rating || 0)
                          ? 'text-amber-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-xs sm:text-sm font-semibold text-amber-700 ml-1">
                    {(restaurant.rating || 0).toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="text-xs font-medium">{restaurant.review_count}</span>
                  <span className="text-xs ml-1">{restaurant.review_count === 1 ? 'avaliação' : 'avaliações'}</span>
                </div>
              </div>
            </div>
          )}
          
          {getDescriptionPreview(restaurant.description) && (
            <p className={`text-gray-600 mt-2 line-clamp-2 text-sm sm:text-base ${centered ? 'text-center' : ''}`}>{getDescriptionPreview(restaurant.description)}</p>
          )}
          
          {/* Display price category with amber colored Euro symbols - only when price_per_person has positive value */}
          {restaurant.price_per_person && restaurant.price_per_person > 0 && (
            <div className={`flex items-center mt-2 ${centered ? 'justify-center flex-col gap-1' : ''}`}>
              <div className="flex items-center">
                {Array(priceCategory.level).fill(0).map((_, i) => (
                  <Euro key={i} className={`h-3 w-3 inline-block ${priceColorClass}`} fill="currentColor" />
                ))}
                {Array(4 - priceCategory.level).fill(0).map((_, i) => (
                  <Euro key={i + priceCategory.level} className="h-3 w-3 inline-block text-gray-300" />
                ))}
                <span className={`ml-1 text-xs ${getPriceLabelClass(priceCategory.level)}`}>{priceCategory.label}</span>
              </div>
              <div className={`text-amber-600 font-semibold text-sm ${centered ? '' : 'ml-auto'}`}>
                €{restaurant.price_per_person.toFixed(2)}
              </div>
            </div>
          )}
          
          {restaurant.location && (
            <div className={`flex items-center text-gray-500 text-xs sm:text-sm mt-2 line-clamp-1 ${centered ? 'justify-center' : ''}`}>
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{restaurant.location}</span>
            </div>
          )}
          
          {restaurant.creator_name && (
            <div className={`mt-2 text-xs text-gray-500 ${centered ? 'text-center' : ''}`}>
              Adicionado por: {restaurant.creator_name}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
