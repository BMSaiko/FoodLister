'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TabbedRestaurantFilters from '@/components/ui/TabbedRestaurantFilters';
import { FiltersProvider, useAuth } from '@/contexts/index';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useVisitsData } from '@/hooks/useVisitsData';
import { useFiltersLogic } from '@/hooks/useFiltersLogic';

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
  const [scrollRestored, setScrollRestored] = React.useState(false);

  const { restaurants, loading } = useRestaurants(searchQuery);
  const { visitsData, loadingVisits, handleVisitsDataUpdate } = useVisitsData(restaurants, user);
  const { filters, setFilters, filteredRestaurants, activeFilters, clearFilters } = useFiltersLogic(restaurants, visitsData, user);

  // Enhanced scroll restoration and search parameter persistence
  React.useEffect(() => {
    if (!loading && restaurants.length > 0 && !scrollRestored) {
      const pendingTarget = sessionStorage.getItem('targetRestaurantId');

      if (pendingTarget) {
        // Try to scroll to target restaurant
        const attemptScroll = (attempts = 0) => {
          const restaurantElement = document.querySelector(`[data-restaurant-id="${pendingTarget}"]`);

          if (restaurantElement) {
            restaurantElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            sessionStorage.removeItem('targetRestaurantId');
            setScrollRestored(true);
          } else if (attempts < 3) {
            // Try again in next animation frame, up to 3 attempts
            requestAnimationFrame(() => attemptScroll(attempts + 1));
          } else {
            // Fallback to saved scroll position
            const savedScrollPosition = sessionStorage.getItem('restaurantsScrollPosition');
            if (savedScrollPosition) {
              window.scrollTo({ top: parseInt(savedScrollPosition, 10), behavior: 'smooth' });
              sessionStorage.removeItem('restaurantsScrollPosition');
            }
            sessionStorage.removeItem('targetRestaurantId');
            setScrollRestored(true);
          }
        };

        // Start attempts after short delay
        setTimeout(() => attemptScroll(), 300);
      } else {
        // No target, but check for saved scroll position
        const savedScrollPosition = sessionStorage.getItem('restaurantsScrollPosition');
        if (savedScrollPosition) {
          setTimeout(() => {
            window.scrollTo({ top: parseInt(savedScrollPosition, 10), behavior: 'smooth' });
            sessionStorage.removeItem('restaurantsScrollPosition');
            setScrollRestored(true);
          }, 100);
        }
      }
    }
  }, [loading, restaurants.length, scrollRestored]);

  // Ensure search parameters are preserved during page refreshes
  React.useEffect(() => {
    if (searchQuery) {
      // Store current search query in session storage to maintain it during refreshes
      sessionStorage.setItem('currentSearchQuery', searchQuery);
    } else {
      // Clear search query from session storage if no search is active
      sessionStorage.removeItem('currentSearchQuery');
    }
  }, [searchQuery]);

  return (
    <>
      <RestaurantsHeader searchQuery={searchQuery} showHeader={showHeader} />

      <TabbedRestaurantFilters
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
        <RestaurantGrid
          restaurants={filteredRestaurants}
          visitsData={visitsData}
          loadingVisits={loadingVisits}
          onVisitsDataUpdate={handleVisitsDataUpdate}
        />
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
