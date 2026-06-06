import { useState, useEffect, useCallback } from 'react';
import type { ListActivityWithUser } from '@/libs/types';

interface UseListActivitiesReturn {
  activities: ListActivityWithUser[];
  total: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => Promise<void>;
}

const PAGE_SIZE = 20;

export function useListActivities(listId: string): UseListActivitiesReturn {
  const [activities, setActivities] = useState<ListActivityWithUser[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async (currentOffset: number, append: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/lists/${listId}/activities?limit=${PAGE_SIZE}&offset=${currentOffset}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const data = await response.json();

      if (append) {
        setActivities((prev) => [...prev, ...(data.activities || [])]);
      } else {
        setActivities(data.activities || []);
      }
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    setOffset(0);
    fetchActivities(0, false);
  }, [fetchActivities]);

  const loadMore = useCallback(() => {
    const newOffset = offset + PAGE_SIZE;
    setOffset(newOffset);
    fetchActivities(newOffset, true);
  }, [offset, fetchActivities]);

  const refetch = useCallback(async () => {
    setOffset(0);
    await fetchActivities(0, false);
  }, [fetchActivities]);

  return {
    activities,
    total,
    isLoading,
    error,
    hasMore: activities.length < total,
    loadMore,
    refetch,
  };
}

