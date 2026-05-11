import { useState, useEffect, useCallback } from 'react';
import { getClient } from '@/libs/supabase/client';
import { isAccountLocked } from '@/libs/verification';
import type { AccountSecurity } from '@/libs/types';

interface ProfileSecurity {
  login_attempts: number | null;
  locked_until: string | null;
}

interface UseAccountSecurityReturn {
  security: AccountSecurity | null;
  loading: boolean;
  error: string | null;
  updateSettings: (settings: Partial<AccountSecurity>) => Promise<void>;
  checkLock: () => Promise<{ locked: boolean; lockedUntil: string | null }>;
}

export function useAccountSecurity(): UseAccountSecurityReturn {
  const [security, setSecurity] = useState<AccountSecurity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = getClient();

  const fetchSecurity = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data, error: profileError } = await (supabase as any)
          .from('profiles')
          .select('login_attempts, locked_until')
          .eq('user_id', session.user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        const profile = data as ProfileSecurity | null;

        setSecurity({
          twoFactorEnabled: false,
          lastPasswordChange: null,
          activeSessions: 1,
          lastLogin: session.user.updated_at ?? null,
          loginAttempts: profile?.login_attempts ?? 0,
          lockedUntil: profile?.locked_until ?? null,
        });
      } else {
        setSecurity(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch account security');
      setSecurity(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSecurity();
  }, [fetchSecurity]);

  const updateSettings = useCallback(async (settings: Partial<AccountSecurity>) => {
    try {
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      const updateData: Record<string, unknown> = {};
      if (settings.twoFactorEnabled !== undefined) {
        console.warn('2FA not yet implemented');
      }

      if (Object.keys(updateData).length > 0) {
        await (supabase as any)
          .from('profiles')
          .update(updateData)
          .eq('user_id', session.user.id);
      }

      await fetchSecurity();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update security settings');
    }
  }, [supabase, fetchSecurity]);

  const checkLock = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { locked: false, lockedUntil: null };
      }
      return await isAccountLocked(session.user.id);
    } catch {
      return { locked: false, lockedUntil: null };
    }
  }, [supabase]);

  return {
    security,
    loading,
    error,
    updateSettings,
    checkLock,
  };
}