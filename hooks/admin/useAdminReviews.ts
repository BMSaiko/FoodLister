'use client';

import { useState, useEffect, useCallback } from 'react';
import { deleteReview } from '@/libs/admin';

export function useAdminReviews(page = 1, limit = 20) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      const res = await fetch(`/api/admin/reviews?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const { data, total: t } = await res.json();
      setReviews(data); setTotal(t);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const handleDelete = useCallback(async (reviewId: string) => {
    const success = await deleteReview(reviewId);
    if (success) { await fetchReviews(); }
    return success;
  }, [fetchReviews]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  return { reviews, total, loading, error, refresh: fetchReviews, deleteReview: handleDelete };
}

