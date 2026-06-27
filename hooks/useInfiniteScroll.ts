"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface UseInfiniteScrollConfig<T> {
  fetchFn: (page: number, limit: number) => Promise<{ items: T[]; total: number }>;
  threshold?: number;
  rootMargin?: string;
  limit?: number;
  enabled?: boolean;
}

export interface UseInfiniteScrollReturn<T> {
  items: T[];
  ref: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  loadMore: () => void;
  reset: () => void;
}

export function useInfiniteScroll<T>(config: UseInfiniteScrollConfig<T>): UseInfiniteScrollReturn<T> {
  const {
    fetchFn,
    threshold = 0.05,
    rootMargin = "400px",
    limit = 25,
    enabled = true,
  } = config;

  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const pageRef = useRef(0);

  const fetchPage = useCallback(
    async (pageNum: number, isAppend: boolean) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      // Cancel any pending request
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();

      if (isAppend) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const result = await fetchFn(pageNum, limit);
        if (result.items.length > 0) {
          setItems((prev) => (isAppend ? [...prev, ...result.items] : result.items));
        }
        const totalPages = Math.ceil(result.total / limit);
        setHasMore(pageNum < totalPages);
        pageRef.current = pageNum;
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [fetchFn, limit]
  );

  const loadMore = useCallback(() => {
    if (!enabled || hasMore === false || isFetchingRef.current) return;

    const nextPage = pageRef.current + 1;
    setPage(nextPage);
    fetchPage(nextPage, true);
  }, [enabled, hasMore, fetchPage]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    pageRef.current = 0;
    setHasMore(true);
    setError(null);
    setIsLoading(true);
    fetchPage(1, false);
  }, [fetchPage]);

  // Fetch first page on mount
  useEffect(() => {
    if (enabled) {
      pageRef.current = 0;
      fetchPage(1, false);
    }
  }, [enabled, fetchPage]);

  // Setup IntersectionObserver
  useEffect(() => {
    if (!enabled || !hasMore) {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isFetchingRef.current && hasMore) {
          loadMore();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(sentinel);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [enabled, hasMore, threshold, rootMargin, loadMore]);

  // Cleanup abort on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  return {
    items,
    ref: sentinelRef,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    page,
    loadMore,
    reset,
  };
}
