'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useAdminRestaurants(page = 1, limit = 20, search = '') {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchRestaurants = useCallback(async (debouncedSearch: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (debouncedSearch) params.set('search', debouncedSearch);
      const res = await fetch(`/api/admin/restaurants?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch restaurants');
      const { data, total: t } = await res.json();
      setRestaurants(data); setTotal(t);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  // Debounce search input by 300ms to avoid race conditions from rapid keystrokes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchRestaurants(search);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, page, limit, fetchRestaurants]);

  return { restaurants, total, loading, error, refresh: () => fetchRestaurants(search) };
}
