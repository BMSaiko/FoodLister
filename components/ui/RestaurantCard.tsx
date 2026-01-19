// components/ui/RestaurantCard.tsx
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Check, X, MapPin, Euro, Tag } from 'lucide-react';
import { convertCloudinaryUrl } from '@/utils/cloudinaryConverter';
import { createClient } from '@/libs/supabase/client';
import { getDescriptionPreview } from '@/utils/formatters';
import { toast } from 'react-toastify';
import RestaurantImagePlaceholder from './RestaurantImagePlaceholder';

const RestaurantCard = ({ restaurant, centered = false }) => {
  const [visited, setVisited] = useState(restaurant.visited || false);
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClient();

  const handleToggleVisited = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsUpdating(true);
    try {
      const newVisitedStatus = !visited;

      const { error } = await (supabase as any)
        .from('restaurants')
        .update({ visited: newVisitedStatus })
        .eq('id', restaurant.id);

      if (error) throw error;

      setVisited(newVisitedStatus);

      // Show success toast
      toast.success(
        newVisitedStatus
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
      // Revert state on error
      setVisited(!visited);

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
  // Converter URL do Cloudinary se necessário
  const imageUrl = convertCloudinaryUrl(restaurant.image_url);
  const hasImage = imageUrl && imageUrl !== '/placeholder-restaurant.jpg' && restaurant.image_url;
  // Function to render prices with € icons
  const renderPriceCategory = (price) => {
    if (price <= 10) return { label: 'Econômico', level: 1 };
    if (price <= 20) return { label: 'Moderado', level: 2 };
    if (price <= 50) return { label: 'Elevado', level: 3 };
    return { label: 'Luxo', level: 4 };
  };

  // Get color class based on price level
  const getPriceColorClass = (level) => {
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
  const getPriceLabelClass = (level) => {
    switch(level) {
      case 1: return 'text-amber-400 font-bold';
      case 2: return 'text-amber-500 font-bold';
      case 3: return 'text-amber-600 font-bold';
      case 4: return 'text-amber-800 font-bold';
      default: return 'text-amber-400 font-medium';
    }
  };

  const priceCategory = renderPriceCategory(restaurant.price_per_person);
  const priceColorClass = getPriceColorClass(priceCategory.level);
  
  // Style of rating based on value
  const getRatingStyle = (rating) => {
    if (rating >= 4.5) return 'bg-green-100 text-green-700';
    if (rating >= 3.5) return 'bg-amber-100 text-amber-700';
    if (rating >= 2.5) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };
  
  const ratingStyle = getRatingStyle(restaurant.rating);

  return (
    <Link href={`/restaurants/${restaurant.id}`} className={centered ? "block w-full" : ""}>
      <div className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full w-full flex flex-col ${centered ? 'min-w-[280px] sm:min-w-[320px]' : ''}`}>
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
          
          {/* Switch Button for visited/not visited status */}
          <button
            onClick={handleToggleVisited}
            disabled={isUpdating}
            className={`absolute top-3 right-3 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-200 cursor-pointer hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
              visited 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
            title={visited ? 'Clique para marcar como não visitado' : 'Clique para marcar como visitado'}
          >
            {visited ? (
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
        <div className={`p-3 sm:p-4 flex-grow ${centered ? 'text-center' : ''}`}>
          <div className={`flex ${centered ? 'flex-col items-center gap-2' : 'justify-between items-start'}`}>
            <h3 className={`font-bold text-base sm:text-lg text-gray-800 line-clamp-1 ${centered ? 'text-center' : ''}`}>{restaurant.name}</h3>
            {visited && (
              <div className={`flex items-center ${ratingStyle} px-2 py-1 rounded ${centered ? '' : 'ml-2'} flex-shrink-0`}>
                <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="currentColor" />
                <span className="font-semibold text-sm">{(restaurant.rating || 0).toFixed(1)}</span>
              </div>
            )}
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

          {/* Display reviews and rating */}
          {visited && restaurant.review_count !== undefined && restaurant.review_count > 0 && (
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
          
          <p className={`text-gray-600 mt-2 line-clamp-2 text-sm sm:text-base ${centered ? 'text-center' : ''}`}>{getDescriptionPreview(restaurant.description)}</p>
          
          {/* Display price category with amber colored Euro symbols - only if visited */}
          {visited && (
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
