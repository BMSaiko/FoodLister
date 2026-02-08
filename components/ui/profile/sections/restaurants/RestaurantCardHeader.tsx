// components/ui/profile/sections/RestaurantCardHeader.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import { Star, MapPin, Euro, Tag } from 'lucide-react';
import { convertCloudinaryUrl } from '@/utils/cloudinaryConverter';

interface RestaurantCardHeaderProps {
  restaurant: {
    name: string;
    imageUrl?: string;
    images?: string[];
    display_image_index?: number;
    location?: string;
    priceLevel?: number;
    rating?: number;
    cuisineTypes: string[];
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
    return convertCloudinaryUrl(restaurant.imageUrl || '');
  };

  const imageUrl = getDisplayImage();
  const hasImage = imageUrl && imageUrl !== '/placeholder-restaurant.jpg' && imageUrl !== '';

  // Function to categorize price level
  const categorizePriceLevel = (price: number) => {
    if (price <= 10) return { label: 'Econômico', level: 1 };
    if (price <= 20) return { label: 'Moderado', level: 2 };
    if (price <= 50) return { label: 'Elevado', level: 3 };
    return { label: 'Luxo', level: 4 };
  };

  // Get color class based on price level
  const getPriceColorClass = (level: number): string => {
    switch(level) {
      case 1: return 'text-amber-400';
      case 2: return 'text-amber-500';
      case 3: return 'text-amber-600';
      case 4: return 'text-amber-800';
      default: return 'text-amber-400';
    }
  };

  const getPriceLabelClass = (level: number): string => {
    switch(level) {
      case 1: return 'text-amber-400 font-bold';
      case 2: return 'text-amber-500 font-bold';
      case 3: return 'text-amber-600 font-bold';
      case 4: return 'text-amber-800 font-bold';
      default: return 'text-amber-400 font-medium';
    }
  };

  // Style of rating based on value
  const getRatingStyle = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-50 text-green-700';
    if (rating >= 3.5) return 'bg-amber-50 text-amber-700';
    if (rating >= 2.5) return 'bg-yellow-50 text-yellow-700';
    return 'bg-red-50 text-red-700';
  };

  return (
    <div className="relative h-72 sm:h-80 lg:h-96 w-full min-w-[280px] max-w-[380px] sm:max-w-[500px] lg:max-w-[600px] min-h-[288px] sm:min-h-[320px] lg:min-h-[384px] aspect-[4/3] sm:aspect-[16/9]">
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
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
          <Star className="h-12 w-12 text-gray-400" />
        </div>
      )}

      {/* Restaurant Rating Badge */}
      {restaurant.rating && (
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full ${getRatingStyle(restaurant.rating)}`}>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3" fill="currentColor" />
            <span className="font-semibold text-xs">{restaurant.rating.toFixed(1)}/5</span>
          </div>
        </div>
      )}

      {/* Restaurant Name Overlay */}
      <div className="absolute bottom-3 left-3 right-3">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
            {restaurant.name}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCardHeader;