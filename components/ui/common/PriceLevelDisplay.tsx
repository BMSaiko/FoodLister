import React from 'react';
import { Euro } from 'lucide-react';

interface PriceLevelDisplayProps {
  price: number;
  showLabel?: boolean;
  showPrice?: boolean;
  className?: string;
}

export default function PriceLevelDisplay({
  price,
  showLabel = true,
  showPrice = true,
  className = ''
}: PriceLevelDisplayProps) {
  
  const categorizePriceLevel = (price: number) => {
    if (price <= 10) return { label: 'Econômico', level: 1 };
    if (price <= 20) return { label: 'Moderado', level: 2 };
    if (price <= 50) return { label: 'Elevado', level: 3 };
    return { label: 'Luxo', level: 4 };
  };

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

  const formatPrice = (price: number): string => {
    return `€${price.toFixed(2)}`;
  };

  const priceCategory = categorizePriceLevel(price);
  const priceColorClass = getPriceColorClass(priceCategory.level);

  return (
    <div className={`flex items-center ${className}`}>
      {/* Price Icons */}
      <div className="flex items-center">
        {Array(priceCategory.level).fill(0).map((_, i) => (
          <Euro key={i} className={`h-3 w-3 sm:h-4 w-4 ${priceColorClass}`} fill="currentColor" />
        ))}
        {Array(4 - priceCategory.level).fill(0).map((_, i) => (
          <Euro key={i + priceCategory.level} className="h-3 w-3 sm:h-4 w-4 text-gray-300" />
        ))}
      </div>

      {/* Price Label */}
      {showLabel && (
        <span className={`ml-1 sm:ml-2 text-xs sm:text-sm ${getPriceLabelClass(priceCategory.level)}`}>
          {priceCategory.label}
        </span>
      )}

      {/* Price Value */}
      {showPrice && (
        <div className="ml-auto text-amber-600 font-semibold">
          {formatPrice(price)}
          <span className="text-xs sm:text-sm text-gray-500 ml-1">por pessoa</span>
        </div>
      )}
    </div>
  );
}
