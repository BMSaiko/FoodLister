'use client';

import React from 'react';

interface RestaurantImagePlaceholderProps {
  name?: string;
  className?: string;
}

const RestaurantImagePlaceholder: React.FC<RestaurantImagePlaceholderProps> = ({ 
  name = 'Restaurante',
  className = ''
}) => {
  // Generate a unique gradient based on the restaurant name
  const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  };

  const getGradientColors = (hash: number) => {
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 40) % 360;
    return {
      from: `hsl(${hue1}, 70%, 15%)`,
      to: `hsl(${hue2}, 60%, 10%)`,
      accent: `hsl(${hue1}, 80%, 60%)`,
    };
  };

  const colors = getGradientColors(hashCode(name));
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className={`absolute inset-0 flex items-center justify-center ${className}`}>
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
        }}
      />

      {/* Decorative circles */}
      <div
        className="absolute top-1/4 left-1/4 w-24 h-24 rounded-full opacity-20"
        style={{ background: colors.accent }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-16 h-16 rounded-full opacity-10"
        style={{ background: colors.accent }}
      />

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Plate icon */}
        <div className="mx-auto mb-3 w-16 h-16 rounded-full border-2 flex items-center justify-center" style={{ borderColor: `${colors.accent}40` }}>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.accent}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-60"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        </div>

        {/* Initial letter */}
        <div
          className="text-3xl font-bold opacity-30 mb-1"
          style={{ color: colors.accent }}
        >
          {initial}
        </div>

        {/* Restaurant name (small) */}
        <p className="text-xs font-medium opacity-40 max-w-[120px] truncate" style={{ color: colors.accent }}>
          {name}
        </p>
      </div>
    </div>
  );
};

export default RestaurantImagePlaceholder;
