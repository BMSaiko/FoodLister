// components/ui/profile/sections/RestaurantCardContent.tsx
"use client";

import React from 'react';

interface RestaurantCardContentProps {
  restaurant: {
    name: string;
    description?: string;
  };
  centered?: boolean;
}

const RestaurantCardContent: React.FC<RestaurantCardContentProps> = ({ 
  restaurant, 
  centered = false 
}) => {
  return (
    <div className={`${centered ? 'text-center' : ''}`}>
      {/* Description Section - Only show if exists */}
      {restaurant.description && (
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-[var(--card-border)] mb-4">
          <p className="text-[var(--foreground)] leading-relaxed text-sm sm:text-base line-clamp-3">
            {restaurant.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default RestaurantCardContent;