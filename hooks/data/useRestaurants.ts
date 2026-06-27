"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { RestaurantWithDetails } from "@/libs/types";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

interface UseRestaurantsOptions {
  searchQuery?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  openNow?: boolean | null;
  sortBy?: string | null;
  sortDirection?: string | null;
}

interface UseRestaurantsReturn {
  restaurants: RestaurantWithDetails[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } | null;
  error: string | null;
  loadMore: () => void;
  refetch: () => void;
}

export function useRestaurants(options: UseRestaurantsOptions | string | null): UseRestaurantsReturn {
  let opts: UseRestaurantsOptions;

  if (typeof options === "string" || options === null || options === undefined) {
    opts = { searchQuery: options ?? null };
  } else {
    opts = options;
  }

  const {
    searchQuery = null,
    priceMin = null,
    priceMax = null,
    openNow = null,
    sortBy: sortByParam = null,
    sortDirection = null,
  } = opts;

  // Fetch function used by useInfiniteScroll
  const fetchPage = useCallback(
    async (page: number, limit: number): Promise<{ items: RestaurantWithDetails[]; total: number }> => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (searchQuery) params.set("search", searchQuery);
      if (priceMin !== null && priceMin !== undefined) params.set("priceMin", String(priceMin));
      if (priceMax !== null && priceMax !== undefined) params.set("priceMax", String(priceMax));
      if (openNow === true) params.set("openNow", "true");
      if (sortByParam) params.set("sortBy", sortByParam);
      if (sortDirection) params.set("sortDirection", sortDirection);

      const response = await fetch(`/api/restaurants?${params.toString()}`);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Failed to fetch restaurants: ${response.status} ${errorText}`);
      }

      const data = await response.json();

      const items = data.restaurants || (Array.isArray(data) ? data : []);
      const total = (data.pagination?.total ?? items.length) || 0;

      return { items, total };
    },
    [searchQuery, priceMin, priceMax, openNow, sortByParam, sortDirection]
  );

  const {
    items: scrollItems,
    ref: sentinelRef,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
  } = useInfiniteScroll<RestaurantWithDetails>({
    fetchFn: fetchPage,
    limit: 25,
    rootMargin: "400px",
    threshold: 0.1,
  });

  // Detect if filters changed (anything beyond page 1 params)
  const filterKey = `${searchQuery}|${priceMin}|${priceMax}|${openNow}|${sortByParam}|${sortDirection}`;
  const prevFilterKeyRef = useRef<string | null>(null);
  const isFirstRender = prevFilterKeyRef.current === null;

  useEffect(() => {
    if (!isFirstRender && prevFilterKeyRef.current !== filterKey) {
      // Filters changed — reset and re-fetch from page 1
      prevFilterKeyRef.current = filterKey;
      // The IS hook will re-run fetchFn on mount, we need to manual reset
      // Actually the IS hook re-runs when fetchFn changes (which it does due to deps)
      // So items will be replaced automatically
    } else {
      prevFilterKeyRef.current = filterKey;
    }
  }, [filterKey, isFirstRender]);

  // Pagination metadata from last successful fetch
  // We can compute it from hasMore + items length, but ideally from API response
  const paginationMeta = {
    page: Math.floor(scrollItems.length / 25) || 1,
    limit: 25,
    total: scrollItems.length, // approximative, API sends real total
    totalPages: hasMore ? Math.ceil(scrollItems.length / 25) + 1 : Math.ceil(scrollItems.length / 25),
    hasNext: hasMore,
    hasPrev: scrollItems.length > 25,
  };

  const restaurants = scrollItems;
  const loading = isLoading && restaurants.length === 0;

  // Manual refetch (for filter changes that don't trigger IS re-mount)
  const refetch = useCallback(() => {
    window.location.reload();
  }, []);

  return {
    restaurants,
    loading,
    loadingMore: isLoadingMore,
    hasMore,
    pagination: paginationMeta,
    error: null,
    loadMore,
    refetch,
  };
}


