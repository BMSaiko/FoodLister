'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AdminUser } from '@/libs/types';
import { getAdminUsers } from '@/libs/admin';

export function useAdminUsers(page = 1, limit = 20, search = '') {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminUsers(page, limit, search);
      if (data) { setUsers(data.users); setTotal(data.total); }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return { users, total, loading, error, refresh: fetchUsers };
}

