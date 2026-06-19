'use client';

import { useState, useEffect, useCallback } from 'react';

export function useAdminRestaurants(page = 1, limit = 20) {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
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

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  return { restaurants, total, loading, error, refresh: fetchRestaurants };
}

