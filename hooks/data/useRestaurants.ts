'use client';

import { useState, useEffect } from 'react';

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  price_per_person?: number;
  rating?: number;
  location?: string;
  source_url?: string;
  creator?: string;
  menu_url?: string;
  phone_numbers?: string[];
  visited: boolean;
  created_at: string;
  updated_at: string;
  creator_id?: string;
  creator_name?: string;
  cuisine_types?: Array<{
    id: string;
    name: string;
    description?: string;
    icon?: string;
  }>;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

interface UseRestaurantsReturn {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  loadMore: () => void;
  loadingMore: boolean;
  hasMore: boolean;
}

interface SavedState {
  restaurants: Restaurant[];
  hasMore: boolean;
  searchQuery: string | null;
  timestamp: number;
}

export function useRestaurants(searchQuery: string | null, savedState?: SavedState | null): UseRestaurantsReturn {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/restaurants?${params.toString()}`);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to fetch restaurants: ${response.status} ${response.statusText} - ${errorText}`);
      }

      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        throw new Error(`Invalid JSON response: ${(jsonError as Error).message}`);
      }

      if (!responseData || typeof responseData !== 'object' || !('restaurants' in responseData)) {
        throw new Error('Invalid response structure: missing restaurants data');
      }

      const { restaurants: data } = responseData;
      if (!Array.isArray(data)) {
        throw new Error('Invalid response structure: restaurants data is not an array');
      }

      setRestaurants(data);
    } catch (err) {
      console.error('Erro ao buscar restaurantes:', err);
      setError((err as Error).message);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if we have a search query from session storage (for page refreshes)
    const sessionSearchQuery = sessionStorage.getItem('currentSearchQuery');
    const shouldUseSessionSearch = searchQuery === null && sessionSearchQuery !== null;
    
    // If we have saved state and it matches current search query, use it
    if (savedState && savedState.searchQuery === searchQuery) {
      setRestaurants(savedState.restaurants);
      setLoading(false);
    } else if (shouldUseSessionSearch && savedState && savedState.searchQuery === sessionSearchQuery) {
      // Use saved state if it matches the session search query
      setRestaurants(savedState.restaurants);
      setLoading(false);
    } else {
      // Fetch data when searchQuery changes or when we don't have matching saved state
      fetchRestaurants();
    }
  }, [searchQuery, savedState]);

  // Simplified return - no more pagination
  return {
    restaurants,
    loading,
    error,
    pagination: null,
    loadMore: () => {}, // No-op function
    loadingMore: false,
    hasMore: false
  };
}
