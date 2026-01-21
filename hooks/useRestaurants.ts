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

export function useRestaurants(searchQuery: string | null): UseRestaurantsReturn {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchRestaurants = async (page: number = 1, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      params.append('page', page.toString());
      params.append('limit', '21');

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

      const { restaurants: data, pagination: paginationData } = responseData;
      if (!Array.isArray(data)) {
        throw new Error('Invalid response structure: restaurants data is not an array');
      }

      if (append) {
        setRestaurants(prev => {
          // Deduplicate restaurants by ID to prevent React key conflicts
          const existingIds = new Set(prev.map(r => r.id));
          const newRestaurants = data.filter(r => !existingIds.has(r.id));
          return [...prev, ...newRestaurants];
        });
      } else {
        setRestaurants(data);
      }

      setPagination(paginationData);
      setCurrentPage(page);
    } catch (err) {
      console.error('Erro ao buscar restaurantes:', err);
      setError((err as Error).message);
      if (!append) {
        setRestaurants([]);
      }
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchRestaurants(1, false);
  }, [searchQuery]);

  const loadMore = () => {
    if (pagination?.hasMore && !loading && !loadingMore) {
      fetchRestaurants(currentPage + 1, true);
    }
  };

  return {
    restaurants,
    loading,
    error,
    pagination,
    loadMore,
    loadingMore,
    hasMore: pagination?.hasMore || false
  };
}
