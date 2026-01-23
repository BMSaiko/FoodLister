'use client';

import RestaurantCard from '@/components/ui/RestaurantCard';

export function RestaurantGrid({ restaurants, visitsData, loadingVisits, onVisitsDataUpdate }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
      {restaurants.map(restaurant => {
        const restaurantVisitsData = visitsData[restaurant.id];
        return (
          <div key={restaurant.id} data-restaurant-id={restaurant.id}>
            <RestaurantCard
              restaurant={restaurant}
              visitsData={restaurantVisitsData}
              loadingVisits={loadingVisits}
              onVisitsDataUpdate={onVisitsDataUpdate}
            />
          </div>
        );
      })}
    </div>
  );
}
