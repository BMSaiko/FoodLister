// components/ui/RestaurantCardFooter.tsx
"use client";

import React from 'react';
import { MapPin, Star } from 'lucide-react';
import { getDescriptionPreview } from '@/utils/formatters';

interface RestaurantCardFooterProps {
  restaurant: {
    description?: string;
    location?: string;
    creator_name?: string;
    review_count?: number;
    rating?: number;
    price_per_person?: number;
  };
  centered?: boolean;
}

const RestaurantCardFooter: React.FC<RestaurantCardFooterProps> = ({ 
  restaurant, 
  centered = false 
}) => {
  return (
    <div className={`${centered ? 'text-center' : ''}`}>
      
      {/* Rating and Price Section */}
      <div className={`flex ${centered ? 'flex-col items-center gap-2' : 'justify-between items-center'} mt-2`}>
        {/* Rating and Review Count */}
        {restaurant.review_count !== undefined && restaurant.review_count > 0 && (
          <div className="flex items-center gap-2">
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
              <span className="font-semibold text-sm text-amber-700 ml-1">
                {(restaurant.rating || 0).toFixed(1)}
              </span>
            </div>
            <div className="flex items-center text-gray-600 text-xs">
              <span className="font-medium">{restaurant.review_count}</span>
              <span className="ml-1">{restaurant.review_count === 1 ? 'avaliação' : 'avaliações'}</span>
            </div>
          </div>
        )}

        {/* Price per Person */}
        {restaurant.price_per_person && restaurant.price_per_person > 0 && (
          <div className="flex items-center gap-2">
            {/* Price Category Label */}
            {(() => {
              const price = restaurant.price_per_person || 0;
              let label = 'Econômico';
              if (price <= 10) label = 'Econômico';
              else if (price <= 20) label = 'Moderado';
              else if (price <= 50) label = 'Elevado';
              else label = 'Luxo';
              
              return (
                <span className="text-xs text-amber-400 font-bold">
                  {label}
                </span>
              );
            })()}
            
            {/* Price Value */}
            <span className="text-amber-600 font-semibold text-sm">
              €{restaurant.price_per_person.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      {getDescriptionPreview(restaurant.description) && (
        <p className={`text-gray-600 mt-2 line-clamp-2 text-sm sm:text-base ${centered ? 'text-center' : ''}`}>
          {getDescriptionPreview(restaurant.description)}
        </p>
      )}
      
      {/* Location */}
      {restaurant.location && (
        <div className={`flex items-center text-gray-500 text-xs sm:text-sm mt-2 line-clamp-1 ${centered ? 'justify-center' : ''}`}>
          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{restaurant.location}</span>
        </div>
      )}
      
      {/* Creator */}
      {restaurant.creator_name && (
        <div className={`mt-2 text-xs text-gray-500 ${centered ? 'text-center' : ''}`}>
          Adicionado por: {restaurant.creator_name}
        </div>
      )}
    </div>
  );
};

export default RestaurantCardFooter;