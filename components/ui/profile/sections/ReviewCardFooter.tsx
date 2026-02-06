// components/ui/profile/sections/ReviewCardFooter.tsx
"use client";

import React from 'react';
import { MapPin, Star, Clock, Euro, DollarSign, MessageCircle } from 'lucide-react';
import { getDescriptionPreview } from '@/utils/formatters';

interface ReviewCardFooterProps {
  review: {
    rating: number;
    comment?: string;
    amountSpent?: number;
    createdAt: string;
    restaurant: {
      location?: string;
      price_per_person?: number;
    };
  };
  centered?: boolean;
}

const ReviewCardFooter: React.FC<ReviewCardFooterProps> = ({ 
  review, 
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

  return (
    <div className={`${centered ? 'text-center' : ''}`}>
      {/* Review Content */}
      {review.comment && (
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 mb-4">
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base line-clamp-3">
            {review.comment}
          </p>
        </div>
      )}

      {/* Review Footer */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start sm:items-center justify-between text-sm text-gray-500">
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-500 fill-current" />
            <span className="font-semibold text-sm">{review.rating.toFixed(1)}/5</span>
          </div>
          {review.amountSpent && (
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${getPriceColorClass(categorizePriceLevel(review.amountSpent).level)}`}>
                {new Intl.NumberFormat('pt-PT', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(review.amountSpent)}
              </span>
              {/* Price Category Label */}
              <span className={`text-xs ${getPriceLabelClass(categorizePriceLevel(review.amountSpent).level)}`}>
                {categorizePriceLevel(review.amountSpent).label}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{new Date(review.createdAt).toLocaleDateString('pt-PT')}</span>
        </div>
      </div>
    </div>
  );
};

export default ReviewCardFooter;