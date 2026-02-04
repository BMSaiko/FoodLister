'use client';

import RestaurantCard from '@/components/ui/RestaurantCard';
import { RestaurantWithDetails, VisitData } from '@/libs/types';

interface RestaurantGridProps {
  restaurants: RestaurantWithDetails[];
  visitsData: { [restaurantId: string]: VisitData };
  loadingVisits: boolean;
  onVisitsDataUpdate: (restaurantId: string, newVisitsData: { visited: boolean; visit_count: number }) => void;
}

export function RestaurantGrid({ restaurants, visitsData, loadingVisits, onVisitsDataUpdate }: RestaurantGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
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