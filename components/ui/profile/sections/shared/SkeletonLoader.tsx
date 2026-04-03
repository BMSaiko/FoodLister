import React from 'react';

interface SkeletonLoaderProps {
  type?: 'review' | 'list' | 'restaurant';
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'review', 
  count = 3, 
  className = '' 
}) => {
  const renderSkeleton = (index: number) => {
    const baseClasses = `
      bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 border border-gray-200
      animate-pulse
      ${className}
    `;

    switch (type) {
      case 'review':
        return (
          <div key={index} className={baseClasses}>
            {/* Header skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-4">
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <div className="h-6 bg-gray-300 rounded w-16"></div>
                  <div className="h-6 bg-gray-300 rounded w-24"></div>
                </div>
              </div>
              <div className="w-20 h-20 bg-gray-300 rounded-lg"></div>
            </div>

            {/* Content skeleton */}
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 mb-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>

            {/* Footer skeleton */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2 sm:gap-4">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </div>
              <div className="h-4 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div key={index} className={baseClasses}>
            {/* Header skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-gray-300 rounded-lg"></div>
                  <div className="h-6 bg-gray-300 rounded w-32"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                </div>
              </div>
              <div className="h-5 w-5 bg-gray-300 rounded"></div>
            </div>

            {/* Footer skeleton */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 items-start sm:items-center justify-between">
              <div className="h-8 bg-gray-300 rounded w-32"></div>
              <div className="h-4 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        );

      case 'restaurant':
        return (
          <div key={index} className={baseClasses}>
            {/* Header skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-4">
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <div className="h-6 bg-gray-300 rounded w-32"></div>
                  <div className="h-6 bg-gray-300 rounded w-16"></div>
                  <div className="h-6 bg-gray-300 rounded w-12"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="h-6 bg-gray-300 rounded w-20"></div>
                  <div className="h-6 bg-gray-300 rounded w-24"></div>
                  <div className="h-6 bg-gray-300 rounded w-28"></div>
                </div>
              </div>
              <div className="w-20 h-20 bg-gray-300 rounded-lg"></div>
            </div>

            {/* Details skeleton */}
            <div className="flex flex-wrap gap-2">
              <div className="h-6 bg-gray-300 rounded w-32"></div>
              <div className="h-6 bg-gray-300 rounded w-28"></div>
              <div className="h-6 bg-gray-300 rounded w-36"></div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {Array.from({ length: count }, (_, index) => renderSkeleton(index))}
      </div>
    </div>
  );
};

interface LoadingButtonSkeletonProps {
  className?: string;
}

export const LoadingButtonSkeleton: React.FC<LoadingButtonSkeletonProps> = ({ className = '' }) => (
  <div className={`flex justify-center pt-6 ${className}`}>
    <div className="h-12 bg-gray-300 rounded-lg w-48 animate-pulse"></div>
  </div>
);

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 active:bg-amber-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {action.icon}
          {action.label}
        </button>
      )}
    </div>
  );
};