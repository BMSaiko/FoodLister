"use client";

import React from 'react';

interface ListSkeletonProps {
  count?: number;
  type?: 'card' | 'list' | 'grid';
}

export default function ListSkeleton({ count = 6, type = 'card' }: ListSkeletonProps) {
  if (type === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-[var(--card-bg)] rounded-lg shadow-[var(--card-shadow)] p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[var(--gray-200)] rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-[var(--gray-200)] rounded w-1/3" />
                <div className="h-4 bg-[var(--gray-200)] rounded w-2/3" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-[var(--gray-200)] rounded-full" />
                  <div className="h-6 w-20 bg-[var(--gray-200)] rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-[var(--card-bg)] rounded-xl shadow-[var(--card-shadow)] overflow-hidden animate-pulse">
          {/* Image placeholder */}
          <div className="h-48 bg-gradient-to-br from-[var(--gray-200)] to-[var(--gray-300)]" />
          
          {/* Content placeholder */}
          <div className="p-4 space-y-3">
            <div className="h-6 bg-[var(--gray-200)] rounded w-3/4" />
            <div className="h-4 bg-[var(--gray-200)] rounded w-full" />
            <div className="h-4 bg-[var(--gray-200)] rounded w-2/3" />
            <div className="flex gap-2 pt-2">
              <div className="h-6 w-20 bg-[var(--gray-200)] rounded-full" />
              <div className="h-6 w-24 bg-[var(--gray-200)] rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}