import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import RestaurantCarousel from './RestaurantCarousel';
import RestaurantImagePlaceholder from './RestaurantImagePlaceholder';

interface RestaurantImagesSectionProps {
  restaurant: {
    images?: string[];
    image_url?: string;
    display_image_index?: number;
  };
}

export default function RestaurantImagesSection({
  restaurant
}: RestaurantImagesSectionProps) {
  
  // Determine display image: use carousel display image if available, fallback to legacy image_url
  const getDisplayImage = () => {
    // If restaurant has images array and display_image_index is valid
    if (restaurant.images && restaurant.images.length > 0) {
      if (restaurant.display_image_index !== undefined && 
          restaurant.display_image_index >= 0 &&
          restaurant.display_image_index < restaurant.images.length) {
        // Use the specified display image
        return restaurant.images[restaurant.display_image_index];
      } else if (restaurant.images.length > 0) {
        // Use first image as fallback
        return restaurant.images[0];
      }
    }
    // Fallback to legacy image_url
    return restaurant.image_url || '';
  };

  const hasImages = restaurant.images && restaurant.images.length > 0;
  const imageUrl = getDisplayImage();
  const hasImage = imageUrl && imageUrl !== '/placeholder-restaurant.jpg' && imageUrl !== '';

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-4">
      {/* Restaurant Images Carousel */}
      <div className="relative">
        {hasImages ? (
          <RestaurantCarousel
            images={restaurant.images}
            className="w-full"
          />
        ) : hasImage ? (
          <div className="relative h-48 sm:h-56 md:h-96 lg:h-[28rem] w-full">
            <img
              src={imageUrl}
              alt={restaurant.image_url || 'Restaurant image'}
              className="object-cover w-full h-full"
              style={{
                minWidth: '100%',
                minHeight: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          </div>
        ) : (
          <RestaurantImagePlaceholder
            iconSize="80"
            textSize="text-lg"
            showText={true}
            className="h-48 sm:h-56 md:h-96 lg:h-[28rem]"
          />
        )}
      </div>
    </div>
  );
}
