'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DashboardStats } from '@/libs/types';
import { getDashboardStats } from '@/libs/admin';

export function useAdminStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
}

