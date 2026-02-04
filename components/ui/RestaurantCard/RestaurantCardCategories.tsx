// components/ui/RestaurantCardCategories.tsx
"use client";

import React from 'react';
import { Tag } from 'lucide-react';

interface RestaurantCardCategoriesProps {
  restaurant: {
    cuisine_types?: Array<{ id: string; name: string }>;
    dietary_options?: Array<{ id: string; name: string; icon?: string }>;
    features?: Array<{ id: string; name: string; icon?: string }>;
  };
  centered?: boolean;
}

const RestaurantCardCategories: React.FC<RestaurantCardCategoriesProps> = ({ 
  restaurant, 
  centered = false 
}) => {
  return (
    <div className={`flex flex-col gap-2 ${centered ? 'items-center' : ''}`}>
      {/* Mostrar categorias se disponíveis */}
      {restaurant.cuisine_types && restaurant.cuisine_types.length > 0 && (
        <div className={`flex flex-wrap gap-1 ${centered ? 'justify-center' : ''}`}>
          {restaurant.cuisine_types.map(type => (
            <span key={type.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800">
              <Tag className="h-3 w-3 mr-1" />
              {type.name}
            </span>
          ))}
        </div>
      )}

      {/* Mostrar opções dietéticas se disponíveis */}
      {restaurant.dietary_options && restaurant.dietary_options.length > 0 && (
        <div className={`flex flex-wrap gap-1 ${centered ? 'justify-center' : ''}`}>
          {restaurant.dietary_options.slice(0, 3).map(option => (
            <span key={option.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
              <span className="mr-1 text-sm">{option.icon || '🥗'}</span>
              {option.name}
            </span>
          ))}
          {restaurant.dietary_options.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
              +{restaurant.dietary_options.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Mostrar recursos se disponíveis */}
      {restaurant.features && restaurant.features.length > 0 && (
        <div className={`flex flex-wrap gap-1 ${centered ? 'justify-center' : ''}`}>
          {restaurant.features.slice(0, 3).map(feature => (
            <span key={feature.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
              <span className="mr-1 text-sm">{feature.icon || '⭐'}</span>
              {feature.name}
            </span>
          ))}
          {restaurant.features.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
              +{restaurant.features.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default RestaurantCardCategories;