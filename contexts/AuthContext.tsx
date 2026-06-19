'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { getClient } from '@/libs/supabase/client';
import { toast } from 'react-toastify';
import { AuthUser, VerificationStatus } from '@/libs/types';
import { authLogger } from '@/utils/authLogger';
import { checkVerificationStatus, sendVerificationEmail, incrementLoginAttempts, resetLoginAttempts, isAccountLocked } from '@/libs/verification';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  verificationStatus: VerificationStatus | null;
  signUp: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  getAccessToken: () => Promise<string | null>;
  checkVerification: () => Promise<void>;
  sendVerification: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const supabase = getClient();
  const previousUserRef = useRef<AuthUser | null>(null);

  useEffect(() => {
    if (user?.id) {
      checkVerificationStatus(user.id).then(status => {
        setVerificationStatus(status);
      });
    } else {
      setVerificationStatus(null);
    }
  }, [user?.id]);

  useEffect(() => {
    let subscription: any = null;

    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const initialUser = session?.user ?? null;
      setUser(initialUser);
      previousUserRef.current = initialUser;

      authLogger.log({
        type: 'session_start',
        timestamp: Date.now(),
        details: {
          hasSession: !!session,
          hasUser: !!initialUser,
          userId: initialUser?.id || undefined,
          sessionExpiresAt: session?.expires_at || undefined
        },
        userId: initialUser?.id || undefined
      });

      if (initialUser !== null) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('loginToastShown', 'true');
        }
      }
      setLoading(false);

      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          const newUser = session?.user ?? null;
          setUser(newUser);
          previousUserRef.current = newUser;
          setLoading(false);

          authLogger.log({
            type: event === 'SIGNED_OUT' ? 'session_expired' : 'session_refresh',
            timestamp: Date.now(),
            details: {
              event,
              hasSession: !!session,
              hasUser: !!newUser,
              userId: newUser?.id || undefined,
              sessionExpiresAt: session?.expires_at || undefined
            },
            userId: newUser?.id || undefined
          });

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
              phone_number: null,
              is_verified: false,
              verified_at: null,
              verification_method: null,
              login_attempts: 0,
              locked_until: null,
            });

          if (profileError && profileError.code !== '23505') {
            // Don't throw here as the auth signup was successful
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

      if (error) {
        throw error;
      }

      // Reset login attempts on success
      if (data.user) {
        await resetLoginAttempts(data.user.id);
      }

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

  const getAccessToken = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      return null;
    }
  };

  const checkVerification = async () => {
    if (user?.id) {
      const status = await checkVerificationStatus(user.id);
      setVerificationStatus(status);
    }
  };

  const sendVerification = async (email: string) => {
    return await sendVerificationEmail(email);
  };

  const value: AuthContextValue = {
    user,
    loading,
    verificationStatus,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    getAccessToken,
    checkVerification,
    sendVerification,
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