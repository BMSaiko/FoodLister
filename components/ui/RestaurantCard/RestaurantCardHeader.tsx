// components/ui/RestaurantCardHeader.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import { convertCloudinaryUrl } from '@/utils/cloudinaryConverter';
import RestaurantImagePlaceholder from './RestaurantImagePlaceholder';
import Icon from '@/components/ui/icons/Icon';

interface RestaurantCardHeaderProps {
  restaurant: {
    name: string;
    rating?: number;
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
  // Determine display image: use carousel display image if available
  const getDisplayImage = () => {
    // If restaurant has images array and display_image_index is valid
    if (restaurant.images && restaurant.images.length > 0) {
      if (restaurant.display_image_index !== undefined && 
          restaurant.display_image_index >= 0 &&
          restaurant.display_image_index < restaurant.images.length) {
        // Use the specified display image
        return convertCloudinaryUrl(restaurant.images[restaurant.display_image_index]);
      }
    }
    // Use first image as fallback
    return restaurant.images && restaurant.images.length > 0 ? convertCloudinaryUrl(restaurant.images[0]) : '';
  };

  const imageUrl = getDisplayImage();
  const hasImage = imageUrl && imageUrl !== '/placeholder-restaurant.jpg' && imageUrl !== '' && !imageUrl.startsWith('data:image');

  // Style of rating based on value
  const getRatingStyle = (rating: number) => {
    if (rating >= 4.5) return 'bg-[var(--success-light)] text-[var(--success)]';
    if (rating >= 3.5) return 'bg-[var(--primary-lighter)] text-[var(--primary-dark)]';
    if (rating >= 2.5) return 'bg-[var(--warning-light)] text-[var(--warning)]';
    return 'bg-[var(--error-light)] text-[var(--error)]';
  };
  
  const ratingStyle = getRatingStyle(restaurant.rating || 0);

  return (
    <div className="relative w-full aspect-[3/2]">
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
        <RestaurantImagePlaceholder name={restaurant.name} />
      )}

      {/* Dark overlay for image */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
      
      {/* Rating Badge */}
      <div className={`absolute top-3 left-3 px-2 py-1 rounded ${ratingStyle}`}>
        <div className="flex items-center gap-1">
          <Icon name="estrela" className="h-3 w-3" fill="currentColor" />
          <span className="font-semibold text-xs">{(restaurant.rating || 0).toFixed(1)}</span>
        </div>
      </div>

    </div>
  );
};

export default RestaurantCardHeader;
