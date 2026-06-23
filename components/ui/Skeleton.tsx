'use client';

import React from 'react';

type SkeletonVariant = 'restaurant-card' | 'list-card' | 'review';

interface SkeletonProps {
  variant?: SkeletonVariant;
  count?: number;
  className?: string;
}

function RestaurantCardSkeleton() {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="h-40 sm:h-48 bg-gray-200 dark:bg-gray-800" />
      <div className="p-4 space-y-3">
        {/* Title + rating */}
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-12" />
        </div>
        {/* Location */}
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
        {/* Tags */}
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-16" />
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-20" />
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-14" />
        </div>
        {/* Price + details */}
        <div className="flex items-center gap-3 pt-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
        </div>
      </div>
    </div>
  );
}

function ListCardSkeleton() {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 sm:p-5 animate-pulse">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="h-12 w-12 bg-gray-200 dark:bg-gray-800 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          {/* Title */}
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
          {/* Description */}
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
        </div>
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16" />
      </div>
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 sm:p-5 animate-pulse">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          {/* Name + rating */}
          <div className="flex items-center gap-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16" />
          </div>
          {/* Comment */}
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
        </div>
      </div>
      {/* Footer */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-20" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-24" />
      </div>
    </div>
  );
}

const skeletonMap: Record<SkeletonVariant, React.FC> = {
  'restaurant-card': RestaurantCardSkeleton,
  'list-card': ListCardSkeleton,
  'review': ReviewSkeleton,
};

export default function Skeleton({
  variant = 'restaurant-card',
  count = 6,
  className = '',
}: SkeletonProps) {
  const SkeletonComponent = skeletonMap[variant];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </div>
  );
}
