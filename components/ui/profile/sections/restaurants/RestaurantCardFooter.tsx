// components/ui/profile/sections/RestaurantCardFooter.tsx
"use client";

import React from 'react';
import { MapPin, Star, Clock, Euro, DollarSign, Tag } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

interface RestaurantCardFooterProps {
  restaurant: {
    name: string;
    description?: string;
    location?: string;
    priceLevel?: number;
    rating?: number;
    createdAt: string;
    cuisineTypes: string[];
    dietaryOptions: string[];
    features: string[];
  };
  centered?: boolean;
}

const RestaurantCardFooter: React.FC<RestaurantCardFooterProps> = ({ 
  restaurant, 
  centered = false 
}) => {
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
    if (rating >= 4.5) return 'bg-green-50 text-green-700 border-green-200';
    if (rating >= 3.5) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (rating >= 2.5) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  return (
    <div className={`${centered ? 'text-center' : ''}`}>
      {/* Restaurant Details */}
      {restaurant.description && (
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 mb-4">
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base line-clamp-3">
            {restaurant.description}
          </p>
        </div>
      )}

      {/* Restaurant Footer */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start sm:items-center justify-between text-sm text-gray-500">
        <div className="flex flex-wrap gap-2 sm:gap-4">
          {restaurant.rating && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded ${getRatingStyle(restaurant.rating)}`}>
              <Star className="h-4 w-4 fill-current" />
              <span className="font-semibold text-sm">{restaurant.rating.toFixed(1)}/5</span>
            </div>
          )}
          {restaurant.priceLevel && (
            <div className={`flex items-center gap-2 px-2 py-1 rounded border ${getPriceColorClass(restaurant.priceLevel)}`}>
              <span className="font-semibold">
                {categorizePriceLevel(restaurant.priceLevel).label}
              </span>
              {/* Price Level Indicator */}
              <div className="flex gap-1">
                {[...Array(restaurant.priceLevel)].map((_, i) => (
                  <DollarSign key={i} className="h-3 w-3" />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded border border-gray-200">
          <Clock className="h-4 w-4" />
          <span>Adicionado em {new Date(restaurant.createdAt).toLocaleDateString('pt-PT')}</span>
        </div>
      </div>

      {/* Restaurant Tags */}
      <div className="flex flex-wrap gap-2 mt-4">
        {restaurant.location && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs sm:text-sm text-gray-600 border border-gray-200">
            <MapPin className="h-3 w-3" />
            {restaurant.location}
          </span>
        )}
        {restaurant.cuisineTypes.length > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs sm:text-sm text-gray-600 border border-gray-200">
            <Tag className="h-3 w-3" />
            Tipos: {restaurant.cuisineTypes.join(', ')}
          </span>
        )}
        {restaurant.dietaryOptions.length > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs sm:text-sm text-gray-600 border border-gray-200">
            <Tag className="h-3 w-3" />
            Opções: {restaurant.dietaryOptions.join(', ')}
          </span>
        )}
        {restaurant.features.length > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs sm:text-sm text-gray-600 border border-gray-200">
            <Tag className="h-3 w-3" />
            Recursos: {restaurant.features.join(', ')}
          </span>
        )}
      </div>
    </div>
  );
};

export default RestaurantCardFooter;