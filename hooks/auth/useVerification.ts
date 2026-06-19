import { useState, useEffect, useCallback } from 'react';
import { getClient } from '@/libs/supabase/client';
import { sendVerificationEmail, verifyEmailToken, checkVerificationStatus } from '@/libs/verification';
import type { VerificationStatus } from '@/libs/types';

interface UseVerificationReturn {
  sendEmail: (email: string) => Promise<{ error: any }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; error: any }>;
  status: VerificationStatus | null;
  loading: boolean;
  error: string | null;
  refreshStatus: () => Promise<void>;
}

export function useVerification(): UseVerificationReturn {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = getClient();

  const refreshStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const verificationStatus = await checkVerificationStatus(session.user.id);
        setStatus(verificationStatus);
      } else {
        setStatus(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check verification status');
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const sendEmail = useCallback(async (email: string) => {
    try {
      setError(null);
      const result = await sendVerificationEmail(email);
      if (result.error) {
        setError(result.error.message || 'Failed to send verification email');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send verification email';
      setError(message);
      return { error: { message } };
    }
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    try {
      setError(null);
      setLoading(true);
      const result = await verifyEmailToken(token);
      if (result.success) {
        await refreshStatus();
      } else if (result.error) {
        setError(result.error.message || 'Failed to verify email');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify email';
      setError(message);
      return { success: false, error: { message } };
    } finally {
      setLoading(false);
    }
  }, [refreshStatus]);

  return {
    sendEmail,
    verifyEmail,
    status,
    loading,
    error,
    refreshStatus,
  };
}