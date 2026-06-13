'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import type { MarketingCampaign, SocialMediaPost, AiWorkflow, SocialPlatform, PostType, WorkflowTrigger } from '@/libs/types';
import { toast } from 'react-toastify';

export function useMarketing() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [workflows, setWorkflows] = useState<AiWorkflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/marketing/campaigns');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.data || []);
      }
    } catch (err) {
      setError('Erro ao carregar campanhas');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/marketing/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.data || []);
      }
    } catch (err) {
      setError('Erro ao carregar posts');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchWorkflows = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/marketing/workflows');
      if (res.ok) {
        const data = await res.json();
        setWorkflows(data.data || []);
      }
    } catch (err) {
      setError('Erro ao carregar workflows');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createCampaign = useCallback(async (data: {
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    targetPlatforms?: string[];
  }) => {
    if (!user) return null;
    setLoading(true);
    try {
      const res = await fetch('/api/marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        setCampaigns((prev) => [result.data, ...prev]);
        toast.success('Campanha criada com sucesso');
        return result.data;
      }
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao criar campanha');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar campanha';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createPost = useCallback(async (data: {
    campaignId?: string;
    restaurantId?: string;
    listId?: string;
    content?: string;
    platform: SocialPlatform;
    postType?: PostType;
    mediaUrls?: string[];
    scheduledFor?: string;
    aiGenerate?: boolean;
  }) => {
    if (!user) return null;
    setLoading(true);
    try {
      const res = await fetch('/api/marketing/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        setPosts((prev) => [result.data, ...prev]);
        toast.success('Post criado com sucesso');
        return result.data;
      }
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao criar post');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar post';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createWorkflow = useCallback(async (data: {
    name: string;
    description?: string;
    triggerType: WorkflowTrigger;
    platform: string;
    promptTemplate: string;
    scheduleCron?: string;
  }) => {
    if (!user) return null;
    setLoading(true);
    try {
      const res = await fetch('/api/marketing/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        setWorkflows((prev) => [result.data, ...prev]);
        toast.success('Workflow criado com sucesso');
        return result.data;
      }
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao criar workflow');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar workflow';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCampaigns();
      fetchPosts();
      fetchWorkflows();
    }
  }, [user, fetchCampaigns, fetchPosts, fetchWorkflows]);

  return {
    campaigns,
    posts,
    workflows,
    loading,
    error,
    fetchCampaigns,
    fetchPosts,
    fetchWorkflows,
    createCampaign,
    createPost,
    createWorkflow,
  };
}
