'use client';

import RestaurantCard from '@/components/ui/RestaurantCard';
import { RestaurantWithDetails, VisitData } from '@/libs/types';
import { EmptyState } from '@/components/ui/common/EmptyState';

interface RestaurantGridProps {
  restaurants: RestaurantWithDetails[];
  visitsData: { [restaurantId: string]: VisitData };
  loadingVisits: boolean;
  onVisitsDataUpdate: (restaurantId: string, newVisitsData: { visited: boolean; visit_count: number }) => void;
  searchQuery?: string | null;
}

export function RestaurantGrid({ restaurants, visitsData, loadingVisits, onVisitsDataUpdate, searchQuery }: RestaurantGridProps) {
  if (!restaurants || restaurants.length === 0) {
    return <EmptyState searchQuery={searchQuery || null} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 justify-items-center sm:justify-items-start">
      {restaurants.map(restaurant => {
        const restaurantVisitsData = visitsData[restaurant.id];
        return (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            visitsData={restaurantVisitsData}
            loadingVisits={loadingVisits}
            onVisitsDataUpdate={onVisitsDataUpdate}
          />
        );
      })}
    </div>
  );
}
