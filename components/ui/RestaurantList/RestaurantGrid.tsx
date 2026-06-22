'use client';

import { motion } from 'motion/react';
import RestaurantCard from '@/components/ui/RestaurantCard';
import { RestaurantWithDetails, VisitData } from '@/libs/types';
import { EmptyState } from '@/components/ui/common/EmptyState';

interface RestaurantGridProps {
  restaurants: RestaurantWithDetails[];
  visitsData: { [restaurantId: string]: VisitData };
  loadingVisits: boolean;
  onVisitsDataUpdate: (restaurantId: string, data: { visited: boolean; visit_count: number }) => void;
  searchQuery?: string | null;
}

export function RestaurantGrid({
  restaurants,
  visitsData,
  loadingVisits,
  onVisitsDataUpdate,
  searchQuery,
}: RestaurantGridProps) {
  if (!restaurants || restaurants.length === 0) {
    return <EmptyState searchQuery={searchQuery || null} />;
  }

  // Bento pattern: alternating large/small
  const bentoPattern = ['large', 'small', 'small', 'large', 'large', 'small'];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {restaurants.map((restaurant, index) => {
        const restaurantVisitsData = visitsData[restaurant.id];
        const variant = bentoPattern[index % bentoPattern.length] as 'large' | 'small';

        return (
          <motion.div
            key={restaurant.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
              duration: 0.5,
              delay: (index % 6) * 0.06,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <RestaurantCard
              restaurant={restaurant}
              visitsData={restaurantVisitsData}
              loadingVisits={loadingVisits}
              onVisitsDataUpdate={onVisitsDataUpdate}
              variant={variant}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
