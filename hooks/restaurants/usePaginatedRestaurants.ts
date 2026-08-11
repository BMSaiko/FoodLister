"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { RestaurantWithDetails } from "@/libs/types";
import { shuffleArray } from "@/utils/random";

const PAGE_SIZE = 21;

interface UsePaginatedRestaurantsOptions {
  searchQuery?: string | null;
  /** true: fetch all (client filtering works over full set). false: paginated feed. */
  all: boolean;
}

interface UsePaginatedRestaurantsReturn {
  restaurants: RestaurantWithDetails[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasNext: boolean;
  loadMore: () => void;
  refetch: () => void;
}

/**
 * Two modes (ponytail: reuse the existing limit=all path for filters instead of
 * moving filters server-side; pagination is only for the unfiltered feed).
 *  - all: limit=all + client shuffle (unchanged useAllRestaurants behaviour)
 *  - feed: server-paginated 21/page, stable sort, append on loadMore
 */
export function usePaginatedRestaurants(
  options: UsePaginatedRestaurantsOptions | null
): UsePaginatedRestaurantsReturn {
  const searchQuery = options?.searchQuery ?? null;
  const all = options?.all ?? false;

  const nextPageRef = useRef(1);
  const [restaurants, setRestaurants] = useState<RestaurantWithDetails[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setHasNext(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const fetchPage = useCallback(async (pageNumber: number, append: boolean) => {
    append ? setLoadingMore(true) : setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(pageNumber));
      params.set("limit", String(PAGE_SIZE));
      if (searchQuery) params.set("search", searchQuery);
      const response = await fetch(`/api/restaurants?${params.toString()}`);
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`API error ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      const items: RestaurantWithDetails[] = Array.isArray(data.restaurants) ? data.restaurants : [];
      setRestaurants(prev => (append ? [...prev, ...items] : items));
      setHasNext(Boolean(data.pagination?.hasNext));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery]);

  // Reset + fetch on mode/search change
  useEffect(() => {
    if (all) {
      fetchAll();
    } else {
      nextPageRef.current = 1;
      fetchPage(1, false);
    }
    // ponytail: fetchPage/fetchAll already keyed on searchQuery; all is explicit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, searchQuery]);

  const loadMore = useCallback(() => {
    if (all || loadingMore || !hasNext) return;
    // ponytail: page lives in a ref, capped by hasNext from the API
    nextPageRef.current += 1;
    fetchPage(nextPageRef.current, true);
  }, [all, loadingMore, hasNext, fetchPage]);

  const refetch = useCallback(() => {
    if (all && rawData.length > 0) {
      setRestaurants(shuffleArray(rawData));
    } else {
      fetchPage(1, false);
    }
  }, [all, rawData, fetchPage]);

  return { restaurants, loading, loadingMore, error, hasNext, loadMore, refetch };
}
