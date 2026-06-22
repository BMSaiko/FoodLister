import React, { useState, useRef, useEffect } from 'react';
import RestaurantCarousel from '../RestaurantList/RestaurantCarousel';
import RestaurantImagePlaceholder from '../RestaurantCard/RestaurantImagePlaceholder';

interface RestaurantImagesSectionProps {
  restaurant: {
    images?: string[];
    image_url?: string;
    display_image_index?: number;
    name?: string;
  };
}

export default function RestaurantImagesSection({
  restaurant
}: RestaurantImagesSectionProps) {

  const getDisplayImage = () => {
    if (restaurant.images && restaurant.images.length > 0) {
      if (restaurant.display_image_index !== undefined &&
          restaurant.display_image_index >= 0 &&
          restaurant.display_image_index < restaurant.images.length) {
        return restaurant.images[restaurant.display_image_index];
      } else if (restaurant.images.length > 0) {
        return restaurant.images[0];
      }
    }
    return restaurant.image_url || '';
  };

  const hasImages = restaurant.images && restaurant.images.length > 0;
  const imageUrl = getDisplayImage();
  const hasImage = imageUrl && imageUrl !== '/placeholder-restaurant.jpg' && imageUrl !== '' && !imageUrl.startsWith('data:image');

  return (
    <div className="mb-4 relative">
      <div className="relative overflow-hidden rounded-2xl">
        {hasImages ? (
          <RestaurantCarousel
            images={restaurant.images}
            className="w-full"
          />
        ) : hasImage ? (
          <div className="relative h-56 sm:h-72 md:h-96 lg:h-[28rem] w-full">
            <img
              src={imageUrl}
              alt={restaurant.image_url || 'Restaurant image'}
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        ) : (
          <RestaurantImagePlaceholder
            name={restaurant.name || "Restaurante"}
            className="h-56 sm:h-72 md:h-96 lg:h-[28rem]"
          />
        )}
      </div>
    </div>
  );
}
