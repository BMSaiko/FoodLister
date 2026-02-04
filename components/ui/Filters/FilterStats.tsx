'use client';

import React from 'react';
import { Filter } from 'lucide-react';

interface FilterStatsProps {
  activeFilters: boolean;
  totalRestaurants: number;
  filteredCount: number;
}

export const FilterStats = React.memo<FilterStatsProps>(({ activeFilters, totalRestaurants, filteredCount }) => {
  if (!activeFilters) return null;

  return (
    <div className="text-sm text-gray-500 mb-4 flex items-center">
      <Filter className="h-3 w-3 mr-1 text-amber-500" />
      <span>
        Mostrando {filteredCount} de {totalRestaurants} restaurantes
      </span>
    </div>
  );
});
