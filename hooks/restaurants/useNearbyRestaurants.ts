'use client';

import { useState, useEffect, useCallback } from 'react';
import type { RestaurantSortBy, SortDirection } from '@/libs/search';

export interface NearbyRestaurant {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_per_person: number | null;
  rating: number | null;
  location: string | null;
  source_url: string | null;
  creator: string | null;
  menu_url: string | null;
  visited: boolean;
  phone_numbers: string[];
  creator_id: string | null;
  creator_name: string | null;
  created_at: string;
  updated_at: string;
  images: string[];
  display_image_index: number;
  menu_links: string[];
  menu_images: string[];
  latitude: number | null;
  longitude: number | null;
  review_count: number;
  opening_hours: string | null;
  distance: number;
}

interface NearbyMeta {
  count: number;
  center: { lat: number; lng: number };
  radius_km: number;
  sort_by: string;
  sort_direction: string;
}

interface UseNearbyRestaurantsReturn {
  restaurants: NearbyRestaurant[];
  meta: NearbyMeta | null;
  loading: boolean;
  error: string | null;
  userLocation: { lat: number; lng: number } | null;
  locationError: string | null;
  requestLocation: () => void;
  searchNearby: (params: {
    lat?: number;
    lng?: number;
    radius?: number;
    sortBy?: RestaurantSortBy;
    sortDirection?: SortDirection;
  }) => Promise<void>;
}

interface UseNearbyRestaurantsOptions {
  autoFetch?: boolean;
  defaultRadius?: number;
  defaultSortBy?: RestaurantSortBy;
  defaultSortDirection?: SortDirection;
}

export function useNearbyRestaurants(
  options: UseNearbyRestaurantsOptions = {}
): UseNearbyRestaurantsReturn {
  const {
    autoFetch = false,
    defaultRadius = 10,
    defaultSortBy = 'distance',
    defaultSortDirection = 'asc',
  } = options;

  const [restaurants, setRestaurants] = useState<NearbyRestaurant[]>([]);
  const [meta, setMeta] = useState<NearbyMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const fetchNearby = useCallback(
    async (lat: number, lng: number, radius?: number, sortBy?: RestaurantSortBy, sortDirection?: SortDirection) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          lat: lat.toString(),
          lng: lng.toString(),
          radius: (radius ?? defaultRadius).toString(),
          sort_by: sortBy ?? defaultSortBy,
          sort_direction: sortDirection ?? defaultSortDirection,
        });

        const response = await fetch(`/api/restaurants/nearby?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch nearby restaurants: ${response.status}`);
        }

        const data = await response.json();
        setRestaurants(data.restaurants || []);
        setMeta(data.meta || null);
      } catch (err) {
        console.error('Error fetching nearby restaurants:', err);
        setError((err as Error).message);
        setRestaurants([]);
        setMeta(null);
      } finally {
        setLoading(false);
      }
    },
    [defaultRadius, defaultSortBy, defaultSortDirection]
  );

  const requestLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationError(null);
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(loc);
        setLoading(false);
        // Auto-fetch nearby restaurants once location is obtained
        fetchNearby(loc.lat, loc.lng);
      },
      (geoError) => {
        setLoading(false);
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setLocationError('Location permission denied. You can still search manually.');
            break;
          case geoError.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable.');
            break;
          case geoError.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('An unknown error occurred while fetching location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  }, [fetchNearby]);

  const searchNearby = useCallback(
    async (params: {
      lat?: number;
      lng?: number;
      radius?: number;
      sortBy?: RestaurantSortBy;
      sortDirection?: SortDirection;
    }) => {
      const lat = params.lat ?? userLocation?.lat;
      const lng = params.lng ?? userLocation?.lng;

      if (lat == null || lng == null) {
        setError('No location provided. Please enable location access or provide coordinates.');
        return;
      }

      await fetchNearby(lat, lng, params.radius, params.sortBy, params.sortDirection);
    },
    [userLocation, fetchNearby]
  );

  // Auto-fetch on mount if autoFetch is enabled
  useEffect(() => {
    if (autoFetch && userLocation) {
      fetchNearby(userLocation.lat, userLocation.lng);
    }
  }, [autoFetch, userLocation, fetchNearby]);

  return {
    restaurants,
    meta,
    loading,
    error,
    userLocation,
    locationError,
    requestLocation,
    searchNearby,
  };
}

