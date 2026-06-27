"use client";

import { useState, useEffect, useCallback } from "react";
import type { RestaurantWithDetails } from "@/libs/types";
import { shuffleArray } from "@/utils/random";

interface UseAllRestaurantsOptions {
  searchQuery?: string | null;
}

interface UseAllRestaurantsReturn {
  restaurants: RestaurantWithDetails[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches ALL restaurants (limit=all) and shuffles client-side.
 * Simple, performant, and gives "infinite" scroll without IntersectionObserver.
 */
export function useAllRestaurants(options: UseAllRestaurantsOptions | null): UseAllRestaurantsReturn {
  const searchQuery = options?.searchQuery ?? null;
  const [restaurants, setRestaurants] = useState<RestaurantWithDetails[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seed, setSeed] = useState(() => Math.random());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("limit", "all");
      params.set("random", "true");
      if (searchQuery) params.set("search", searchQuery);

      const response = await fetch(`/api/restaurants?${params.toString()}`);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const items = Array.isArray(data.restaurants) ? data.restaurants : [];
      setRawData(items);
      setRestaurants(shuffleArray(items));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Refetch = reshuffle existing data (no API call needed for random!)
  const refetch = useCallback(() => {
    if (rawData.length > 0) {
      setSeed(Math.random());
      setRestaurants(shuffleArray(rawData));
    } else {
      fetchAll();
    }
  }, [rawData, fetchAll]);

  return { restaurants, loading, error, refetch };
}
