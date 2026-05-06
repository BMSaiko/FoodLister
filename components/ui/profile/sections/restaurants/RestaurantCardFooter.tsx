// components/ui/profile/sections/RestaurantCardFooter.tsx
"use client";

import React from 'react';
import { MapPin, Star, Clock, DollarSign, Tag } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

interface RestaurantCardFooterProps {
  restaurant: {
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
      case 1: return 'text-[var(--amber-400)]';
      case 2: return 'text-[var(--amber-500)]';
      case 3: return 'text-[var(--amber-600)]';
      case 4: return 'text-[var(--amber-800)]';
      default: return 'text-[var(--amber-400)]';
    }
  };

  // Style of rating based on value
  const getRatingStyle = (rating: number) => {
    if (rating >= 4.5) return 'bg-[var(--green-50)] text-[var(--green-700)] border-[var(--green-200)]';
    if (rating >= 3.5) return 'bg-[var(--amber-50)] text-[var(--amber-700)] border-[var(--amber-200)]';
    if (rating >= 2.5) return 'bg-[var(--yellow-50)] text-[var(--yellow-700)] border-[var(--yellow-200)]';
    return 'bg-[var(--red-50)] text-[var(--red-700)] border-[var(--red-200)]';
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
      {/* Restaurant Footer - Metadata */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start sm:items-center justify-between text-sm text-[var(--gray-500)]">
        <div className="flex flex-wrap gap-2 sm:gap-4">
          {/* Rating Badge */}
          {restaurant.rating && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded ${getRatingStyle(restaurant.rating)}`}>
              <Star className="h-4 w-4 fill-current" />
              <span className="font-semibold text-sm">{restaurant.rating.toFixed(1)}/5</span>
            </div>
          )}
          
          {/* Price Level Badge */}
          {restaurant.priceLevel && restaurant.priceLevel > 0 && (
            <div className={`flex items-center gap-2 px-2 py-1 rounded border ${getPriceColorClass(restaurant.priceLevel)}`}>
              <span className="font-semibold">
                {categorizePriceLevel(restaurant.priceLevel).label}
              </span>
              <div className="flex gap-0.5">
                {[...Array(Math.max(1, Math.min(4, restaurant.priceLevel)))].map((_, i) => (
                  <DollarSign key={i} className="h-3 w-3 opacity-80" />
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Date Badge */}
        <div className="flex items-center gap-1 px-2 py-1 rounded border border-[var(--gray-200)]">
          <Clock className="h-4 w-4" />
          <span>{formatDateForDisplay(restaurant.createdAt)}</span>
        </div>
      </div>

      {/* Tags Section */}
      <div className="flex flex-wrap gap-2 mt-3">
        {/* Location Tag */}
        {restaurant.location && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-br from-[var(--green-50)] to-[var(--green-100)] rounded-full text-xs text-[var(--green-800)] border border-[var(--green-200)] shadow-sm">
            <MapPin className="h-3.5 w-3.5" />
            <span>{restaurant.location}</span>
          </span>
        )}
        
        {/* Cuisine Types Tag */}
        {restaurant.cuisineTypes.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-br from-[var(--amber-50)] to-[var(--amber-100)] rounded-full text-xs text-[var(--amber-800)] border border-[var(--amber-200)] shadow-sm">
            <Tag className="h-3.5 w-3.5" />
            <span>{restaurant.cuisineTypes.slice(0, 2).join(', ')}</span>
            {restaurant.cuisineTypes.length > 2 && (
              <span className="text-[var(--gray-500)]">+{restaurant.cuisineTypes.length - 2}</span>
            )}
          </span>
        )}
        
        {/* Dietary Options Tag */}
        {restaurant.dietaryOptions.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-br from-[var(--blue-50)] to-[var(--blue-100)] rounded-full text-xs text-[var(--blue-800)] border border-[var(--blue-200)] shadow-sm">
            <Tag className="h-3.5 w-3.5" />
            <span>{restaurant.dietaryOptions.slice(0, 2).join(', ')}</span>
            {restaurant.dietaryOptions.length > 2 && (
              <span className="text-[var(--gray-500)]">+{restaurant.dietaryOptions.length - 2}</span>
            )}
          </span>
        )}
      </div>
    </div>
  );
};

export default RestaurantCardFooter;