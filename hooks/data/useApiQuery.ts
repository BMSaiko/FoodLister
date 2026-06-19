/**
 * useApiQuery - Generic hook for API queries (GET requests)
 * Provides caching, deduplication, background refetching, and pagination
 * Similar to React Query's useQuery but simpler
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/libs/apiClient';

export interface UseApiQueryOptions<T> {
  /** Cache TTL in milliseconds (default: 5 minutes) */
  staleTime?: number;
  /** Whether to auto-fetch on mount (default: true) */
  enabled?: boolean;
  /** Refetch when window regains focus (default: true) */
  refetchOnWindowFocus?: boolean;
  /** Number of retries on failure (default: 2) */
  retry?: number;
  /** Success callback */
  onSuccess?: (data: T) => void;
  /** Error callback */
  onError?: (error: Error) => void;
  /** Initial data to use before fetching */
  initialData?: T;
}

export interface UseApiQueryResult<T> {
  /** The fetched data */
  data: T | undefined;
  /** Error if request failed */
  error: Error | null;
  /** True if currently fetching */
  isLoading: boolean;
  /** True if fetching (including background refetches) */
  isFetching: boolean;
  /** True if data is stale */
  isStale: boolean;
  /** Function to manually refetch */
  refetch: () => Promise<void>;
  /** Function to invalidate cache and refetch */
  invalidate: () => void;
}

// Global query cache
interface QueryCacheEntry<T> {
  data: T;
  timestamp: number;
  staleTime: number;
}

const queryCache = new Map<string, QueryCacheEntry<any>>();
const activeObservers = new Map<string, Set<() => void>>();

/**
 * Generate a stable query key from URL and params
 */
function getQueryKey(url: string, params?: Record<string, any>): string {
  const key = params ? `${url}?${JSON.stringify(params)}` : url;
  return key;
}

/**
 * Check if cached data is stale
 */
function isStale(key: string): boolean {
  const entry = queryCache.get(key);
  if (!entry) return true;
  return Date.now() - entry.timestamp > entry.staleTime;
}

/**
 * Get cached data if not stale
 */
function getCachedData<T>(key: string): T | undefined {
  const entry = queryCache.get(key);
  if (!entry) return undefined;
  if (isStale(key)) return undefined;
  return entry.data;
}

/**
 * Set cached data
 */
function setCachedData<T>(key: string, data: T, staleTime: number): void {
  queryCache.set(key, {
    data,
    timestamp: Date.now(),
    staleTime
  });
  
  // Notify all observers
  const observers = activeObservers.get(key);
  if (observers) {
    for (const observer of observers) {
      observer();
    }
  }
}

/**
 * Invalidate cache for a key
 */
function invalidateKey(key: string): void {
  queryCache.delete(key);
  
  // Notify all observers
  const observers = activeObservers.get(key);
  if (observers) {
    for (const observer of observers) {
      observer();
    }
  }
}

/**
 * Register observer for cache updates
 */
function addObserver(key: string, observer: () => void): () => void {
  if (!activeObservers.has(key)) {
    activeObservers.set(key, new Set());
  }
  activeObservers.get(key)!.add(observer);
  
  return () => {
    const observers = activeObservers.get(key);
    if (observers) {
      observers.delete(observer);
      if (observers.size === 0) {
        activeObservers.delete(key);
      }
    }
  };
}

export function useApiQuery<T = any>(
  url: string,
  params?: Record<string, any>,
  options: UseApiQueryOptions<T> = {}
): UseApiQueryResult<T> {
  const {
    staleTime = 5 * 60 * 1000, // 5 minutes
    enabled = true,
    refetchOnWindowFocus = true,
    retry = 2,
    onSuccess,
    onError,
    initialData
  } = options;

  const queryKey = getQueryKey(url, params);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
  const lastFetchTimeRef = useRef<number>(0);

  // Initialize state with cached data or initial data
  const [data, setData] = useState<T | undefined>(() => {
    const cached = getCachedData<T>(queryKey);
    return cached ?? initialData;
  });
  
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const cached = getCachedData<T>(queryKey);
    return !cached && enabled;
  });
  const [isFetching, setIsFetching] = useState<boolean>(() => {
    const cached = getCachedData<T>(queryKey);
    return !cached && enabled;
  });
  const [staleVersion, setStaleVersion] = useState(0);

  // Fetch function
  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;
    
    // Check cache first (unless forced)
    if (!force) {
      const cached = getCachedData<T>(queryKey);
      if (cached !== undefined) {
        setData(cached);
        setIsLoading(false);
        setIsFetching(false);
        return;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsFetching(true);
    if (!data) setIsLoading(true);
    lastFetchTimeRef.current = Date.now();

    try {
      const response = await apiClient.get<T>(url, {
        cache: !force,
        cacheTTL: staleTime,
        retry,
        signal: abortController.signal
      });

      if (!isMountedRef.current) return;

      setData(response.data);
      setError(null);
      setCachedData(queryKey, response.data, staleTime);
      onSuccess?.(response.data);
    } catch (err) {
      if (!isMountedRef.current) return;
      if (err instanceof Error && err.message === 'Request aborted') return;
      
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsFetching(false);
      }
    }
  }, [url, queryKey, enabled, staleTime, retry, data, onSuccess, onError]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      const cached = getCachedData<T>(queryKey);
      if (cached !== undefined) {
        setData(cached);
        setIsLoading(false);
        setIsFetching(false);
        
        // If stale, refetch in background
        if (isStale(queryKey)) {
          fetchData(false);
        }
      } else {
        fetchData(false);
      }
    }

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [queryKey, enabled, fetchData]);

  // Register observer for cache updates
  useEffect(() => {
    const unsubscribe = addObserver(queryKey, () => {
      const cached = getCachedData<T>(queryKey);
      if (cached !== undefined) {
        setData(cached);
        setStaleVersion(v => v + 1);
      }
    });

    return unsubscribe;
  }, [queryKey]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      // Only refetch if stale and enough time has passed
      const timeSinceLastFetch = Date.now() - lastFetchTimeRef.current;
      if (isStale(queryKey) && timeSinceLastFetch > 1000) {
        fetchData(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [queryKey, refetchOnWindowFocus, fetchData]);

  // Refetch function
  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // Invalidate function
  const invalidate = useCallback(() => {
    invalidateKey(queryKey);
    fetchData(true);
  }, [queryKey, fetchData]);

  // Check if data is stale
  const isDataStale = isStale(queryKey);

  return {
    data,
    error,
    isLoading,
    isFetching,
    isStale: isDataStale,
    refetch,
    invalidate
  };
}

/**
 * Hook for paginated API queries
 */
export function useApiPaginatedQuery<T = any>(
  baseUrl: string,
  params?: Record<string, any>,
  options: UseApiQueryOptions<{ data: T[]; hasMore: boolean; nextCursor?: string }> = {}
) {
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const queryResult = useApiQuery<{ data: T[]; hasMore: boolean; nextCursor?: string }>(
    baseUrl,
    { ...params, cursor: nextCursor || undefined },
    options
  );

  // Update allData when new data arrives
  useEffect(() => {
    if (queryResult.data?.data) {
      setAllData(prev => {
        // Deduplicate by ID
        const existingIds = new Set(prev.map((item: any) => item?.id).filter(Boolean));
        const newItems = queryResult.data!.data.filter((item: any) => !existingIds.has(item?.id));
        return [...prev, ...newItems];
      });
      setHasMore(queryResult.data.hasMore ?? false);
      setNextCursor(queryResult.data.nextCursor ?? null);
    }
  }, [queryResult.data]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
      const response = await apiClient.get<{ data: T[]; hasMore: boolean; nextCursor?: string }>(
        baseUrl,
        {
          cache: false,
          signal: new AbortController().signal
        }
      );

      if (response.data?.data) {
        setAllData(prev => {
          const existingIds = new Set(prev.map((item: any) => item?.id).filter(Boolean));
          const newItems = response.data.data.filter((item: any) => !existingIds.has(item?.id));
          return [...prev, ...newItems];
        });
        setHasMore(response.data.hasMore ?? false);
        setNextCursor(response.data.nextCursor ?? null);
      }
    } catch (error) {
      console.error('Error loading more:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [baseUrl, hasMore, isLoadingMore]);

  // Reset function
  const reset = useCallback(() => {
    setAllData([]);
    setHasMore(true);
    setNextCursor(null);
    queryResult.invalidate();
  }, [queryResult]);

  return {
    ...queryResult,
    data: allData,
    hasMore,
    isLoadingMore,
    loadMore,
    reset
  };
}

/**
 * Invalidate a specific query cache
 */
export function invalidateQuery(url: string, params?: Record<string, any>): void {
  const key = getQueryKey(url, params);
  const observers = activeObservers.get(key);
  queryCache.delete(key);
  
  if (observers) {
    for (const observer of observers) {
      observer();
    }
  }
}

/**
 * Invalidate all query caches matching a pattern
 */
export function invalidateQueries(pattern: string | RegExp): void {
  for (const key of queryCache.keys()) {
    if (typeof pattern === 'string') {
      if (key.includes(pattern)) {
        queryCache.delete(key);
      }
    } else {
      if (pattern.test(key)) {
        queryCache.delete(key);
      }
    }
  }
  
  // Notify all observers
  for (const [key, observers] of activeObservers) {
    if (typeof pattern === 'string') {
      if (key.includes(pattern)) {
        for (const observer of observers) {
          observer();
        }
      }
    } else {
      if (pattern.test(key)) {
        for (const observer of observers) {
          observer();
        }
      }
    }
  }
}

/**
 * Clear all query caches
 */
export function clearQueryCache(): void {
  queryCache.clear();
}