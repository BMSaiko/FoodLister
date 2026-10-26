'use client';

import React from 'react';
import Icon from '@/components/ui/icons/Icon';

interface FilterStatsProps {
  activeFilters: boolean;
  totalRestaurants: number;
  filteredCount: number;
}

export const FilterStats = React.memo<FilterStatsProps>(({ activeFilters, totalRestaurants, filteredCount }) => {
  if (!activeFilters) return null;

  return (
    <div className="text-sm text-[var(--foreground-muted)] mb-4 flex items-center">
      <Icon name="filtros" className="h-3 w-3 mr-1 text-[var(--primary)]" />
      <span>
        Mostrando {filteredCount} de {totalRestaurants} restaurantes
      </span>
    </div>
  );
});
