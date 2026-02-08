// components/ui/profile/sections/RestaurantCard.tsx
"use client";

import React from 'react';
import { Star, MapPin, Euro, Clock, Share2, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { convertCloudinaryUrl } from '@/utils/cloudinaryConverter';
import { TouchButton } from '../shared';
import RestaurantCardHeader from './RestaurantCardHeader';
import RestaurantCardContent from './RestaurantCardContent';
import RestaurantCardActions from './RestaurantCardActions';

interface RestaurantCardProps {
  restaurant: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    images?: string[];
    display_image_index?: number;
    location?: string;
    priceLevel?: number;
    rating?: number;
    createdAt: string;
    cuisineTypes: string[];
    dietaryOptions: string[];
    features: string[];
  };
  isOwnRestaurant: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  className?: string;
  dataRestaurantId?: string;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  isOwnRestaurant,
  onEdit,
  onDelete,
  onShare,
  className = '',
  dataRestaurantId
}) => {
  const hasImage = restaurant.imageUrl || (restaurant.images && restaurant.images.length > 0);

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

  const handleCardClick = (e: React.MouseEvent) => {
    // Check if the click target is an interactive element
    const target = e.target as HTMLElement;
    const interactiveElements = ['button', 'a', 'input', 'textarea', 'select'];
    
    if (interactiveElements.includes(target.tagName.toLowerCase()) || 
        target.closest('button') || 
        target.closest('a')) {
      return;
    }

    // Navigate to restaurant page
    window.location.href = `/restaurants/${restaurant.id}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow keyboard navigation for accessibility
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.location.href = `/restaurants/${restaurant.id}`;
    }
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 group ${className}`}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`Restaurante ${restaurant.name}`}
      data-restaurant-id={dataRestaurantId}
    >
      {/* Restaurant Image Section - Clickable for navigation */}
      <div 
        className="relative h-72 sm:h-80 lg:h-96 w-full min-w-[280px] max-w-[380px] sm:max-w-[500px] lg:max-w-[600px] min-h-[288px] sm:min-h-[320px] lg:min-h-[384px] aspect-[4/3] sm:aspect-[16/9] cursor-pointer group-hover:scale-[1.02] transition-transform duration-200"
        onClick={handleCardClick}
      >
        {hasImage ? (
          <img
            src={convertCloudinaryUrl(restaurant.imageUrl || (restaurant.images && restaurant.images[0]) || '')}
            alt={restaurant.name}
            className="w-full h-full object-cover"
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

        {/* Restaurant Actions - Positioned over the image */}
        <RestaurantCardActions
          restaurant={restaurant}
          isOwnRestaurant={isOwnRestaurant}
          onEdit={onEdit}
          onDelete={onDelete}
          onShare={onShare}
          className="absolute top-3 right-3"
        />
      </div>

      {/* Content Area */}
      <div className="p-4" onClick={handleCardClick}>
        {/* Restaurant Content - Improved design */}
        <RestaurantCardContent 
          restaurant={restaurant} 
          centered={false}
        />
      </div>
    </div>
  );
};

export default RestaurantCard;