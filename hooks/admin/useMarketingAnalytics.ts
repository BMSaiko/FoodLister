'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMarketingAnalytics, type MarketingAnalytics } from '@/libs/marketing';

export function useMarketingAnalytics() {
  const [data, setData] = useState<MarketingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMarketingAnalytics();
      if (!result) throw new Error('Failed to load marketing analytics');
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load marketing analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}
