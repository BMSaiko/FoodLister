'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/libs/supabase/client';
import { RestaurantWithDetails } from '@/libs/types';

interface Filters {
  search?: string;
  cuisine_types?: string[];
  features?: string[];
  dietary_options?: string[];
  price_range?: { min?: number; max?: number };
  rating_range?: { min?: number; max?: number };
  location?: { city?: string };
  visit_count?: { min?: number; max?: number };
  visited?: boolean;
  not_visited?: boolean;
  cuisine_search?: string;
  features_search?: string;
  dietary_search?: string;
}

const initialFilters: Filters = {
  search: '',
  cuisine_types: [],
  features: [],
  dietary_options: [],
  price_range: { min: 0, max: 100 },
  rating_range: { min: 0, max: 5 },
  location: { city: '' },
  visit_count: { min: 0, max: 100 },
  visited: false,
  not_visited: false,
  cuisine_search: '',
  features_search: '',
  dietary_search: ''
};

interface UseListFilterLogicReturn {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  filteredRestaurants: RestaurantWithDetails[];
  activeFilters: boolean;
  clearFilters: () => void;
  loading: boolean;
}

/**
 * Hook for managing filters in list creation/editing
 * Fetches all restaurants and applies filters to generate a preview
 */
export function useListFilterLogic(): UseListFilterLogicReturn {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [restaurants, setRestaurants] = useState<RestaurantWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all restaurants with relationships
  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      const supabase = createClient();

      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select(`
            *,
            cuisine_types:restaurant_cuisine_types(
              cuisine_type:cuisine_types(*)
            ),
            features:restaurant_features(
              feature:restaurant_features(*)
            ),
            dietary_options:restaurant_dietary_options(
              dietary_option:restaurant_dietary_options(*)
            )
          `);

        if (error) {
          console.error('Error fetching restaurants:', error);
          setRestaurants([]);
        } else {
          // Transform the data to match the expected format
          const transformed = (data as any[]).map(restaurant => ({
            ...restaurant,
            cuisine_types: restaurant.cuisine_types
              ?.map((rel: any) => rel.cuisine_type)
              .filter(Boolean) || [],
            features: restaurant.features
              ?.map((rel: any) => rel.feature)
              .filter(Boolean) || [],
            dietary_options: restaurant.dietary_options
              ?.map((rel: any) => rel.dietary_option)
              .filter(Boolean) || []
          }));
          setRestaurants(transformed);
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Apply filters to restaurants
  const filteredRestaurants = useMemo(() => {
    if (!restaurants.length || loading) return [];

    const filtered = restaurants.filter(restaurant => {
      // Search filter
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase().trim();
        const restaurantName = restaurant.name?.toLowerCase() || '';
        const restaurantLocation = restaurant.location?.toLowerCase() || '';
        const restaurantDescription = restaurant.description?.toLowerCase() || '';

        if (
          !restaurantName.includes(searchTerm) &&
          !restaurantLocation.includes(searchTerm) &&
          !restaurantDescription.includes(searchTerm)
        ) {
          return false;
        }
      }

      // Price range filter
      if (filters.price_range) {
        const { min, max } = filters.price_range;
        const price = restaurant.price_per_person;
        if (price !== undefined && price !== null) {
          if (min !== undefined && price < min) return false;
          if (max !== undefined && price > max) return false;
        }
      }

      // Rating range filter
      if (filters.rating_range) {
        const { min, max } = filters.rating_range;
        const rating = typeof restaurant.rating === 'string'
          ? parseFloat(restaurant.rating)
          : restaurant.rating;

        if (rating !== undefined && rating !== null) {
          if (min !== undefined && rating < min) return false;
          if (max !== undefined && rating > max) return false;
        }
      }

      // Cuisine types filter
      if (filters.cuisine_types && filters.cuisine_types.length > 0) {
        const restaurantCuisineIds = restaurant.cuisine_types?.map((type: any) => type.id) || [];
        const hasMatchingCuisine = filters.cuisine_types.some(
          (cuisineId: string) => restaurantCuisineIds.includes(cuisineId)
        );
        if (!hasMatchingCuisine) return false;
      }

      // Features filter
      if (filters.features && filters.features.length > 0) {
        const restaurantFeatureIds = restaurant.features?.map((f: any) => f.id) || [];
        const hasMatchingFeature = filters.features.some(
          (featureId: string) => restaurantFeatureIds.includes(featureId)
        );
        if (!hasMatchingFeature) return false;
      }

      // Dietary options filter
      if (filters.dietary_options && filters.dietary_options.length > 0) {
        const restaurantDietaryIds = restaurant.dietary_options?.map((d: any) => d.id) || [];
        const hasMatchingDietary = filters.dietary_options.some(
          (dietaryId: string) => restaurantDietaryIds.includes(dietaryId)
        );
        if (!hasMatchingDietary) return false;
      }

      // Location filter
      if (filters.location?.city && filters.location.city.trim()) {
        const citySearch = filters.location.city.toLowerCase().trim();
        const restaurantLocation = restaurant.location?.toLowerCase() || '';
        if (!restaurantLocation.includes(citySearch)) return false;
      }

      return true;
    });

    return filtered;
  }, [filters, restaurants, loading]);

  // Check if any filters are active
  const activeFilters = useMemo((): boolean => {
    return Boolean(
      (filters.search && filters.search.trim() !== '') ||
      (filters.location?.city && filters.location.city.trim() !== '') ||
      (filters.price_range?.min !== 0 || filters.price_range?.max !== 100) ||
      (filters.rating_range?.min !== 0 || filters.rating_range?.max !== 5) ||
      (filters.cuisine_types && filters.cuisine_types.length > 0) ||
      (filters.features && filters.features.length > 0) ||
      (filters.dietary_options && filters.dietary_options.length > 0)
    );
  }, [filters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  return {
    filters,
    setFilters,
    filteredRestaurants,
    activeFilters,
    clearFilters,
    loading
  };
}