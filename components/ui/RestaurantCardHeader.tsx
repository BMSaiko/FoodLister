// components/ui/RestaurantCardHeader.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import { Star, MapPin, Euro, Tag } from 'lucide-react';
import { convertCloudinaryUrl } from '@/utils/cloudinaryConverter';
import RestaurantImagePlaceholder from './RestaurantImagePlaceholder';

interface RestaurantCardHeaderProps {
  restaurant: {
    name: string;
    rating?: number;
    image_url?: string;
    images?: string[];
    display_image_index?: number;
    location?: string;
    price_per_person?: number;
    cuisine_types?: Array<{ id: string; name: string }>;
  };
  centered?: boolean;
}

const RestaurantCardHeader: React.FC<RestaurantCardHeaderProps> = ({ 
  restaurant, 
  centered = false 
}) => {
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

  return (
    <div className="relative h-56 sm:h-72 w-full min-h-[224px] sm:min-h-[288px]">
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

      {/* Rating Badge */}
      <div className={`absolute top-3 left-3 px-2 py-1 rounded ${ratingStyle}`}>
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3" fill="currentColor" />
          <span className="font-semibold text-xs">{(restaurant.rating || 0).toFixed(1)}</span>
        </div>
      </div>

    </div>
  );
};

export default RestaurantCardHeader;