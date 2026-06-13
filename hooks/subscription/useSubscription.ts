'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import type { UserSubscription, SubscriptionPlan, SubscriptionTier } from '@/libs/types';
import { isSubscriptionActive } from '@/libs/subscription';
import { toast } from 'react-toastify';

/**
 * Return type for the useSubscription hook.
 * Provides subscription state and management functions.
 */
interface UseSubscriptionReturn {
  subscription: UserSubscription | null;
  plans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
  createCheckout: (planId: string, interval: 'monthly' | 'yearly') => Promise<string | null>;
  cancelSubscription: (id: string) => Promise<boolean>;
  cancelSubscriptionImmediately: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  isPremium: boolean;
  isPro: boolean;
  tier: SubscriptionTier;
}

/**
 * Hook for managing user subscription state and Stripe checkout.
 * Fetches current subscription and available plans on mount.
 * @returns Subscription state + management functions (createCheckout, cancel, refresh)
 */
export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setPlans([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/subscriptions');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription || null);
        setPlans(data.plans || []);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError('Erro ao carregar subscrição');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createCheckout = useCallback(async (
    planId: string,
    interval: 'monthly' | 'yearly'
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, interval }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.url;
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao criar checkout');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar checkout';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelSubscriptionFn = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        toast.success('Subscrição será cancelada no final do período');
        await fetchSubscription();
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao cancelar subscrição');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cancelar';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSubscription]);

  const cancelSubscriptionImmediatelyFn = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        toast.success('Subscrição cancelada');
        await fetchSubscription();
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao cancelar subscrição');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cancelar';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSubscription]);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setPlans([]);
    }
  }, [user, fetchSubscription]);

  const active = isSubscriptionActive(subscription);
  const tier: SubscriptionTier = active
    ? (subscription?.plan?.name?.toLowerCase().includes('pro') ? 'pro'
      : subscription?.plan?.name?.toLowerCase().includes('premium') ? 'premium'
      : 'free')
    : 'free';

  return {
    subscription,
    plans,
    loading,
    error,
    createCheckout,
    cancelSubscription: cancelSubscriptionFn,
    cancelSubscriptionImmediately: cancelSubscriptionImmediatelyFn,
    refresh: fetchSubscription,
    isPremium: tier === 'premium' || tier === 'pro',
    isPro: tier === 'pro',
    tier,
  };
}
