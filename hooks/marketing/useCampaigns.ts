'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  type Campaign,
} from '@/libs/marketing';

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCampaigns();
      if (!data) throw new Error('Failed to load campaigns');
      setCampaigns(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (input: Partial<Campaign>) => {
    const data = await createCampaign(input);
    if (data) setCampaigns((prev) => [data, ...prev]);
    return data;
  }, []);

  const update = useCallback(async (id: string, input: Partial<Campaign>) => {
    const data = await updateCampaign(id, input);
    if (data) setCampaigns((prev) => prev.map((c) => (c.id === id ? data : c)));
    return data;
  }, []);

  const remove = useCallback(async (id: string) => {
    const ok = await deleteCampaign(id);
    if (ok) setCampaigns((prev) => prev.filter((c) => c.id !== id));
    return ok;
  }, []);

  return { campaigns, loading, error, refresh, create, update, remove };
}
