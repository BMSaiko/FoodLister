'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from 'react-toastify';

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  meal_invitations: boolean;
  collaborator_updates: boolean;
  list_activity: boolean;
  system_updates: boolean;
  weekly_digest: boolean;
}

const defaultPreferences: NotificationPreferences = {
  email_notifications: true,
  push_notifications: false,
  meal_invitations: true,
  collaborator_updates: true,
  list_activity: true,
  system_updates: true,
  weekly_digest: false,
};

export function useNotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const result = await response.json();
        setPreferences(result.data || defaultPreferences);
      }
    } catch (err) {
      console.error('Error fetching notification preferences:', err);
      setError('Erro ao carregar preferências');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const savePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    if (!user) return false;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPreferences),
      });

      if (response.ok) {
        const result = await response.json();
        setPreferences(result.data || { ...preferences, ...newPreferences });
        toast.success('Preferências atualizadas com sucesso');
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao salvar preferências');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar preferências';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, preferences]);

  const togglePreference = useCallback(async (key: keyof NotificationPreferences) => {
    const newValue = !preferences[key];
    const updated = { ...preferences, [key]: newValue };
    setPreferences(updated);
    const success = await savePreferences({ [key]: newValue });
    if (!success) {
      setPreferences(preferences); // Revert on failure
    }
  }, [preferences, savePreferences]);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user, fetchPreferences]);

  return {
    preferences,
    loading,
    error,
    fetchPreferences,
    savePreferences,
    togglePreference,
  };
}
