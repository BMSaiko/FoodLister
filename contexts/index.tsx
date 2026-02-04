'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getClient } from '@/libs/supabase/client';
import { toast } from 'react-toastify';
import { useSecureApiClient } from '@/hooks/useSecureApiClient';
import { AuthUser } from '@/libs/types';
import { ModalProvider, useModal } from './ModalContext';

interface FiltersContextValue {
  clearTrigger: number;
  clearFilters: () => void;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  getAccessToken: () => Promise<string | null>;
}

const FiltersContext = createContext<FiltersContextValue | null>(null);

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const [clearTrigger, setClearTrigger] = useState(0);

  const clearFilters = () => {
    setClearTrigger(prev => prev + 1);
  };

  return (
    <FiltersContext.Provider value={{ clearTrigger, clearFilters }}>
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error('useFilters must be used within a FiltersProvider');
  }
  return context;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasShownSignInToast, setHasShownSignInToast] = useState(false);
  const previousUserRef = useRef<AuthUser | null>(null);
  const supabase = getClient();

  useEffect(() => {
    let subscription: any = null;

    const initializeAuth = async () => {
      // Get initial session first
      const { data: { session } } = await supabase.auth.getSession();
      const initialUser = session?.user ?? null;
      setUser(initialUser);
      previousUserRef.current = initialUser;
      // If user is already signed in on page load, mark toast as shown
      if (initialUser !== null) {
        setHasShownSignInToast(true);
      }
      setLoading(false);

      // Now listen for auth changes
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          const newUser = session?.user ?? null;
          setUser(newUser);
          previousUserRef.current = newUser;
          setLoading(false);

          if (event === 'SIGNED_OUT') {
            toast.info('Você foi desconectado');
          } else if (event === 'PASSWORD_RECOVERY') {
            toast.info('Verifique seu email para redefinir a senha');
          }
        }
      );
      subscription = sub;
    };

    initializeAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Create profile automatically with display_name as email prefix
      if (data.user) {
        try {
          const emailPrefix = email.split('@')[0];

          const { error: profileError } = await (supabase as any)
            .from('profiles')
            .insert({
              user_id: data.user.id,
              display_name: emailPrefix,
              bio: null,
              avatar_url: null,
              website: null,
              location: null,
              phone_number: null
            });

          if (profileError && profileError.code !== '23505') { // Ignore duplicate key error
            // Don't throw here as the auth signup was successful
          } else {
          }
        } catch (profileCreateError) {
          // Don't throw here as the auth signup was successful
        }
      }

      if (data.user && !data.session) {
        toast.success('Verifique seu email para confirmar a conta!');
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(errorMessage);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Return the complete session data for proper redirect handling
      return { data, session: data.session, user: data.user, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(errorMessage);
      return { data: null, session: null, user: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Clear login toast flag when signing out
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('loginToastShown');
      }
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(errorMessage);
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast.success('Email de redefinição enviado!');
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(errorMessage);
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success('Senha atualizada com sucesso!');
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(errorMessage);
      return { error };
    }
  };

  // Function to get current access token
  const getAccessToken = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      return null;
    }
  };

  const value: AuthContextValue = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    getAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
