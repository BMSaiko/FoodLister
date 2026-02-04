// components/ui/RestaurantCard/RestaurantImagePlaceholder.tsx
"use client";

import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface RestaurantImagePlaceholderProps {
  iconSize?: string;
  textSize?: string;
  showText?: boolean;
  className?: string;
}

const RestaurantImagePlaceholder: React.FC<RestaurantImagePlaceholderProps> = ({ 
  iconSize = "h-12 w-12", 
  textSize = "text-xs", 
  showText = true,
  className = ""
}) => {
  return (
    <div className={`absolute inset-0 bg-gradient-to-br from-amber-100 via-amber-50 to-amber-200 flex items-center justify-center ${className}`}>
      <div className="text-center text-amber-600">
        <ImageIcon className={`${iconSize} mx-auto mb-2 opacity-50`} />
        {showText && <p className={`${textSize} font-medium opacity-75`}>Imagem indisponível</p>}
      </div>
    </div>
  );
};

export default RestaurantImagePlaceholder;