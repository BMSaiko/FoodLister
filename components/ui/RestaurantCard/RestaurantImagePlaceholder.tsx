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
    <div className={`absolute inset-0 bg-gradient-to-br from-[var(--primary-lighter)] via-[var(--primary-lighter)] to-[var(--primary-light)] flex items-center justify-center ${className}`} style={{
      minHeight: '100%',
      minWidth: '100%',
      maxWidth: '360px',
      width: '100%'
    }}>
      <div className="text-center text-primary">
        <ImageIcon className={`${iconSize} mx-auto mb-2 opacity-50`} />
        {showText && <p className={`${textSize} font-medium opacity-75`}>Imagem indisponível</p>}
      </div>
    </div>
  );
};

export default RestaurantImagePlaceholder;