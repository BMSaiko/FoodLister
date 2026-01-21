'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import RestaurantFilters from '@/components/ui/RestaurantFilters';
import { FiltersProvider, useAuth } from '@/contexts/index';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useVisitsData } from '@/hooks/useVisitsData';
import { useFiltersLogic } from '@/hooks/useFiltersLogic';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { RestaurantsHeader } from '@/components/ui/RestaurantsHeader';
import { RestaurantGrid } from '@/components/ui/RestaurantGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterStats } from '@/components/ui/FilterStats';

// Component para mostrar loading
function RestaurantsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array(6).fill(0).map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-md h-56 sm:h-64 md:h-72 animate-pulse" />
      ))}
    </div>
  );
}

// Component to handle the search params logic and filtering
function RestaurantsContent({ showHeader = true }) {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const { user } = useAuth();

  const { restaurants, loading, loadMore, loadingMore, hasMore } = useRestaurants(searchQuery);
  const { visitsData, loadingVisits, handleVisitsDataUpdate } = useVisitsData(restaurants, user);
  const { filters, setFilters, filteredRestaurants, activeFilters, clearFilters } = useFiltersLogic(restaurants, visitsData, user);

  // Infinite scroll hook
  const sentinelRef = useInfiniteScroll({
    hasMore,
    loading,
    loadingMore,
    onLoadMore: loadMore,
    threshold: 200
  });

  return (
    <>
      <RestaurantsHeader searchQuery={searchQuery} showHeader={showHeader} />

      <RestaurantFilters
        filters={filters}
        setFilters={setFilters}
        clearFilters={clearFilters}
        autoApply={true}
      />

      <FilterStats
        activeFilters={activeFilters}
        totalRestaurants={restaurants.length}
        filteredCount={filteredRestaurants.length}
      />

      {loading ? (
        <RestaurantsLoading />
      ) : filteredRestaurants.length > 0 ? (
        <>
          <RestaurantGrid
            restaurants={filteredRestaurants}
            visitsData={visitsData}
            loadingVisits={loadingVisits}
            onVisitsDataUpdate={handleVisitsDataUpdate}
          />

          {/* Infinite scroll sentinel */}
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center mt-8">
              {loadingMore ? (
                <div className="flex items-center space-x-2 text-amber-600">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
                  <span className="text-sm font-medium">Carregando mais restaurantes...</span>
                </div>
              ) : (
                <div className="h-10 flex items-center justify-center">
                  <div className="text-sm text-gray-500">Role para carregar mais</div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <EmptyState searchQuery={searchQuery} />
      )}
    </>
  );
}

// Main component with Suspense
export default function RestaurantsList({ showHeader = true }) {
  return (
    <FiltersProvider>
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <Suspense fallback={<RestaurantsLoading />}>
          <RestaurantsContent showHeader={showHeader} />
        </Suspense>
      </div>
    </FiltersProvider>
  );
}
