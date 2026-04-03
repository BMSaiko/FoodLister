import React from 'react';
import { SkeletonLoader } from '../shared';

interface RestaurantSkeletonLoaderProps {
  count?: number;
  showProgress?: boolean;
  message?: string;
}

const RestaurantSkeletonLoader: React.FC<RestaurantSkeletonLoaderProps> = ({
  count = 12, // Default to loading all expected restaurants at once
  showProgress = true,
  message = "Carregando todos os restaurantes..."
}) => {
  return (
    <div className="space-y-6">
      {/* Loading message with progress indicator */}
      {showProgress && (
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-3 text-amber-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
            <span className="text-lg font-medium">{message}</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Por favor, aguarde enquanto carregamos todos os restaurantes...
          </p>
        </div>
      )}

      {/* Restaurant grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
          >
            {/* Image skeleton */}
            <div className="h-72 sm:h-80 lg:h-96 bg-gray-300"></div>
            
            {/* Content skeleton */}
            <div className="p-4 space-y-3">
              {/* Restaurant name */}
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              
              {/* Rating and metadata */}
              <div className="flex items-center gap-2">
                <div className="h-4 bg-gray-300 rounded w-16"></div>
                <div className="h-4 bg-gray-300 rounded w-20"></div>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
              </div>
              
              {/* Description */}
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <div className="h-6 bg-gray-300 rounded-full w-16"></div>
                <div className="h-6 bg-gray-300 rounded-full w-20"></div>
                <div className="h-6 bg-gray-300 rounded-full w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional loading indicators */}
      {showProgress && (
        <div className="text-center text-sm text-gray-500">
          <p>Isso pode levar alguns segundos dependendo da quantidade de restaurantes...</p>
        </div>
      )}
    </div>
  );
};

export default RestaurantSkeletonLoader;