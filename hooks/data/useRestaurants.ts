'use client';

import { useState, useEffect, useCallback } from 'react';
import type { RestaurantWithDetails } from '@/libs/types';

interface UseRestaurantsOptions {
  searchQuery?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  openNow?: boolean | null;
  sortBy?: string | null;
  sortDirection?: string | null;
  savedState?: any;
}

interface UseRestaurantsReturn {
  restaurants: RestaurantWithDetails[];
  loading: boolean;
  error: string | null;
  pagination: any;
  loadMore: () => void;
  loadingMore: boolean;
  hasMore: boolean;
  refetch: () => void;
}

// Support both old signature (searchQuery: string | null, savedState?: any)
// and new signature (options: UseRestaurantsOptions)
export function useRestaurants(
  searchQueryOrOptions?: string | null | UseRestaurantsOptions,
  savedState?: any
): UseRestaurantsReturn {
  let options: UseRestaurantsOptions;

  if (typeof searchQueryOrOptions === 'string' || searchQueryOrOptions === null || searchQueryOrOptions === undefined) {
    // Old signature
    options = { searchQuery: searchQueryOrOptions ?? null, savedState };
  } else {
    // New signature
    options = searchQueryOrOptions;
  }

  const {
    searchQuery = null,
    priceMin = null,
    priceMax = null,
    openNow = null,
    sortBy: sortByParam = null,
    sortDirection = null,
  } = options;

  const [restaurants, setRestaurants] = useState<RestaurantWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (priceMin !== null && priceMin !== undefined) params.append('priceMin', String(priceMin));
      if (priceMax !== null && priceMax !== undefined) params.append('priceMax', String(priceMax));
      if (openNow !== null && openNow !== undefined && openNow !== false) params.append('openNow', 'true');
      if (sortByParam) params.append('sortBy', sortByParam);
      if (sortDirection) params.append('sortDirection', sortDirection);

      const response = await fetch(`/api/restaurants?${params.toString()}`);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to fetch restaurants: ${response.status} ${errorText}`);
      }

      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        throw new Error(`Invalid JSON response: ${(jsonError as Error).message}`);
      }
      if (!responseData || typeof responseData !== 'object') {
        throw new Error('Invalid response structure');
      }

      // Support both { restaurants: [...] } and direct array formats
      const data = responseData.restaurants || responseData.data || (Array.isArray(responseData) ? responseData : []);
      if (!Array.isArray(data)) {
        throw new Error('Invalid response structure');
      }

      setRestaurants(data);
    } catch (err) {
      console.error('Erro ao buscar restaurantes:', err);
      setError((err as Error).message);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, priceMin, priceMax, openNow, sortByParam, sortDirection]);

  useEffect(() => {
    if (savedState && savedState.searchQuery === searchQuery) {
      setRestaurants(savedState.restaurants);
      setLoading(false);
    } else {
      fetchRestaurants();
    }
  }, [searchQuery, priceMin, priceMax, openNow, sortByParam, sortDirection, fetchRestaurants, savedState]);

  return {
    restaurants,
    loading,
    error,
    pagination: null,
    loadMore: () => {},
    loadingMore: false,
    hasMore: false,
    refetch: fetchRestaurants,
  };
}
