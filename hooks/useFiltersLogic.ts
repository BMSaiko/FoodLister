'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFilters } from '@/contexts/index';
import { RestaurantWithDetails, RestaurantVisitsData } from '@/libs/types';

interface User {
  id: string;
  email?: string;
  // Add other user properties as needed
}

interface Filters {
  search?: string;
  cuisine_types?: string[];
  features?: string[];
  dietary_options?: string[];
  price_range?: {
    min?: number;
    max?: number;
  };
  rating_range?: {
    min?: number;
    max?: number;
  };
  location?: {
    city?: string;
    distance?: number;
    coordinates?: { lat: number; lng: number };
  };
  visit_count?: { min?: number; max?: number };
  visited?: boolean;
  not_visited?: boolean;
}

interface UseFiltersLogicReturn {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  filteredRestaurants: RestaurantWithDetails[];
  activeFilters: boolean;
  clearFilters: () => void;
}

const initialFilters: Filters = {
  search: '',
  cuisine_types: [],
  features: [],
  dietary_options: [],
  price_range: { min: 0, max: 100 },
  rating_range: { min: 0, max: 5 },
  location: { city: '', distance: 50 },
  visit_count: { min: 0, max: 100 },
  visited: false,
  not_visited: false
};

export function useFiltersLogic(
  restaurants: RestaurantWithDetails[],
  visitsData: RestaurantVisitsData,
  user: User | null
): UseFiltersLogicReturn {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [activeFilters, setActiveFilters] = useState<boolean>(false);
  const { clearTrigger } = useFilters();

  // Clear filters when clearTrigger changes
  useEffect(() => {
    if (clearTrigger > 0) {
      setFilters(initialFilters);
      setActiveFilters(false);
    }
  }, [clearTrigger]);

  // Apply filters automatically when filters, restaurants or visits data change
  const filteredRestaurants = useMemo(() => {
    if (!restaurants.length) return restaurants;

    const filtered = restaurants.filter(restaurant => {
      // Search filter
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase().trim();
        const restaurantName = restaurant.name?.toLowerCase() || '';
        const restaurantLocation = restaurant.location?.toLowerCase() || '';
        
        if (!restaurantName.includes(searchTerm) && !restaurantLocation.includes(searchTerm)) {
          return false;
        }
      }

      // Price range filter
      if (filters.price_range) {
        const { min, max } = filters.price_range;
        if (restaurant.price_per_person !== undefined && restaurant.price_per_person !== null) {
          if (min !== undefined && restaurant.price_per_person < min) {
            return false;
          }
          if (max !== undefined && restaurant.price_per_person > max) {
            return false;
          }
        }
      }

      // Rating range filter
      if (filters.rating_range) {
        const { min, max } = filters.rating_range;
        if (restaurant.rating !== undefined && restaurant.rating !== null) {
          const rating = typeof restaurant.rating === 'string' ? parseFloat(restaurant.rating) : restaurant.rating;
          if (min !== undefined && rating < min) {
            return false;
          }
          if (max !== undefined && rating > max) {
            return false;
          }
        }
      }

      // Cuisine types filter
      if (filters.cuisine_types && filters.cuisine_types.length > 0) {
        const restaurantCuisineIds = restaurant.cuisine_types?.map(type => type.id) || [];
        const hasMatchingCuisine = filters.cuisine_types.some(cuisineId =>
          restaurantCuisineIds.includes(cuisineId)
        );
        if (!hasMatchingCuisine) {
          return false;
        }
      }

      // Features filter
      if (filters.features && filters.features.length > 0) {
        const restaurantFeatureIds = restaurant.features?.map(feature => feature.id) || [];
        const hasMatchingFeature = filters.features.some(featureId =>
          restaurantFeatureIds.includes(featureId)
        );
        if (!hasMatchingFeature) {
          return false;
        }
      }

      // Dietary options filter
      if (filters.dietary_options && filters.dietary_options.length > 0) {
        const restaurantDietaryIds = restaurant.dietary_options?.map(option => option.id) || [];
        const hasMatchingDietary = filters.dietary_options.some(dietaryId =>
          restaurantDietaryIds.includes(dietaryId)
        );
        if (!hasMatchingDietary) {
          return false;
        }
      }

      // Location filter
      if (filters.location) {
        const { city, distance, coordinates } = filters.location;
        
        // City filter
        if (city && city.trim()) {
          const restaurantLocation = restaurant.location?.toLowerCase() || '';
          if (!restaurantLocation.includes(city.toLowerCase().trim())) {
            return false;
          }
        }
        
        // Distance filter (requires coordinates)
        if (distance !== undefined && coordinates) {
          if (restaurant.latitude && restaurant.longitude) {
            const distanceKm = calculateDistance(
              coordinates.lat,
              coordinates.lng,
              restaurant.latitude,
              restaurant.longitude
            );
            if (distanceKm > distance) {
              return false;
            }
          } else {
            // Restaurant without coordinates doesn't match distance filter
            return false;
          }
        }
      }

      // Visit count filter (users only)
      if (user && filters.visit_count) {
        const { min, max } = filters.visit_count;
        const restaurantVisitsData = visitsData[restaurant.id];
        const visitCount = restaurantVisitsData ? restaurantVisitsData.visit_count : 0;
        
        if (min !== undefined && visitCount < min) {
          return false;
        }
        if (max !== undefined && visitCount > max) {
          return false;
        }
      }

      // Visit status filters (users only)
      if (user) {
        const restaurantVisitsData = visitsData[restaurant.id];
        const isVisited = restaurantVisitsData ? restaurantVisitsData.visited : false;

        if (filters.visited && !isVisited) {
          return false;
        }

        if (filters.not_visited && isVisited) {
          return false;
        }
      } else {
        // For non-logged users, visit filters don't apply
        if (filters.visited) {
          return false; // No restaurant is considered visited for non-logged users
        }
      }

      return true;
    });

    setActiveFilters(true);
    return filtered;
  }, [filters, restaurants, visitsData, user]);

  // Limpar filtros
  const clearFilters = () => {
    setFilters(initialFilters);
    setActiveFilters(false);
  };

  return {
    filters,
    setFilters,
    filteredRestaurants,
    activeFilters,
    clearFilters
  };
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
