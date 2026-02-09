// components/ui/profile/sections/RestaurantCardContent.tsx
"use client";

import React from 'react';
import { Star, MapPin, Euro, Clock, DollarSign, Tag } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

interface RestaurantCardContentProps {
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

const RestaurantCardContent: React.FC<RestaurantCardContentProps> = ({ 
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

  // Style of rating based on value
  const getRatingStyle = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-50 text-green-700 border-green-200';
    if (rating >= 3.5) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (rating >= 2.5) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  // Format date in a more readable way
  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    if (diffDays < 365) return date.toLocaleDateString('pt-PT', { month: 'short', day: 'numeric' });
    
    return date.toLocaleDateString('pt-PT', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className={`${centered ? 'text-center' : ''}`}>
      {/* Description Section - Only show if exists */}
      {restaurant.description && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 mb-4 shadow-sm hover:shadow-md transition-shadow duration-200">
          <p className="text-blue-800 leading-relaxed text-sm sm:text-base line-clamp-3 font-light">
            {restaurant.description}
          </p>
        </div>
      )}

      {/* Key Details Row - Compact and elegant */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start sm:items-center justify-between text-sm text-amber-800 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3 border border-amber-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {/* Rating Badge */}
          {restaurant.rating && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full ${getRatingStyle(restaurant.rating)} border border-amber-300`}>
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="font-semibold text-xs">{restaurant.rating.toFixed(1)}/5</span>
            </div>
          )}
          
          {/* Price Level Badge */}
          {restaurant.priceLevel && restaurant.priceLevel > 0 && (
            <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-amber-300 ${getPriceColorClass(restaurant.priceLevel)}`}>
              <span className="text-xs font-medium">
                {categorizePriceLevel(restaurant.priceLevel).label}
              </span>
              <div className="flex gap-0.5">
                {[...Array(Math.max(1, Math.min(4, restaurant.priceLevel)))].map((_, i) => (
                  <DollarSign key={i} className="h-2.5 w-2.5 opacity-80" />
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Date Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{formatDateForDisplay(restaurant.createdAt)}</span>
        </div>
      </div>

      {/* Smart Tags Section - Only show relevant tags */}
      <div className="flex flex-wrap gap-2 mt-3">
        {/* Location Tag */}
        {restaurant.location && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-br from-green-50 to-green-100 rounded-full text-xs text-green-800 border border-green-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <MapPin className="h-3.5 w-3.5 text-gray-500" />
            <span>{restaurant.location}</span>
          </span>
        )}
        
        {/* Cuisine Types Tag */}
        {restaurant.cuisineTypes.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-br from-green-50 to-green-100 rounded-full text-xs text-green-800 border border-green-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <Tag className="h-3.5 w-3.5 text-gray-500" />
            <span>{restaurant.cuisineTypes.slice(0, 2).join(', ')}</span>
            {restaurant.cuisineTypes.length > 2 && (
              <span className="text-gray-500">+{restaurant.cuisineTypes.length - 2}</span>
            )}
          </span>
        )}
        
        {/* Dietary Options Tag */}
        {restaurant.dietaryOptions.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-br from-green-50 to-green-100 rounded-full text-xs text-green-800 border border-green-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <Tag className="h-3.5 w-3.5 text-gray-500" />
            <span>{restaurant.dietaryOptions.slice(0, 2).join(', ')}</span>
            {restaurant.dietaryOptions.length > 2 && (
              <span className="text-gray-500">+{restaurant.dietaryOptions.length - 2}</span>
            )}
          </span>
        )}
      </div>
    </div>
  );
};

export default RestaurantCardContent;