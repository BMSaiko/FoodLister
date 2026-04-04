/**
 * useAuthActions - Hook for authentication actions (signIn, signUp, signOut)
 * Separates auth actions from session state management
 */

import { useCallback } from 'react';
import { getClient } from '@/libs/supabase/client';
import { toast } from 'react-toastify';
import { logError } from '@/utils/logger';

export interface SignInResult {
  success: boolean;
  error: Error | null;
}

export interface SignUpResult {
  success: boolean;
  user: any | null;
  error: Error | null;
}

export interface UseAuthActionsOptions {
  onSignInSuccess?: () => void;
  onSignOut?: () => void;
}

export function useAuthActions(options: UseAuthActionsOptions = {}) {
  const { onSignInSuccess, onSignOut } = options;
  const supabase = getClient();

  const signIn = useCallback(async (email: string, password: string): Promise<SignInResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.session) {
        toast.success('Login realizado com sucesso!', {
          position: "top-center",
          autoClose: 3000
        });
        onSignInSuccess?.();
        return { success: true, error: null };
      }

      return { success: false, error: null };
    } catch (error) {
      logError('Error signing in', error);
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      toast.error('Erro ao fazer login. Verifique suas credenciais.', {
        position: "top-center",
        autoClose: 4000
      });
      return { success: false, error: error as Error };
    }
  }, [supabase.auth, onSignInSuccess]);

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata?: Record<string, any>
  ): Promise<SignUpResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Cadastro realizado com sucesso!', {
          position: "top-center",
          autoClose: 3000
        });
        return { success: true, user: data.user, error: null };
      }

      return { success: false, user: null, error: null };
    } catch (error) {
      logError('Error signing up', error);
      toast.error('Erro ao criar conta. Tente novamente.', {
        position: "top-center",
        autoClose: 4000
      });
      return { success: false, user: null, error: error as Error };
    }
  }, [supabase.auth]);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      
      // Clear all authentication data from browser storage
      if (typeof document !== 'undefined') {
        // Clear cookies
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos) : c;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });
      }
      
      // Clear localStorage (including Supabase session keys)
      if (typeof localStorage !== 'undefined') {
        // Remove Supabase-specific keys first
        const supabaseKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
            supabaseKeys.push(key);
          }
        }
        supabaseKeys.forEach(key => localStorage.removeItem(key));
        localStorage.clear();
      }
      
      // Clear sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
      
      // Clear service worker cache
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name);
          });
        });
      }
      
      onSignOut?.();
    } catch (error) {
      logError('Error signing out', error);
    }
  }, [supabase.auth, onSignOut]);

  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;

      toast.success('Email de recuperação enviado!', {
        position: "top-center",
        autoClose: 3000
      });
      return true;
    } catch (error) {
      logError('Error resetting password', error);
      toast.error('Erro ao enviar email de recuperação.', {
        position: "top-center",
        autoClose: 4000
      });
      return false;
    }
  }, [supabase.auth]);

  return {
    signIn,
    signUp,
    signOut,
    resetPassword
  };
}