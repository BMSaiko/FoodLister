import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getClient } from '@/libs/supabase/client';
import { toast } from 'react-toastify';
import { AuthUser, SupabaseAuthSession } from '@/libs/types';
import { logError, logInfo } from '@/utils/logger';

interface AuthState {
  session: SupabaseAuthSession | null;
  user: AuthUser | null;
  loading: boolean;
  isRefreshing: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
    isRefreshing: false
  });
  
  const router = useRouter();
  const supabase = getClient();

  // Clear all authentication data
  const clearAuthData = useCallback(() => {
    try {
      // Clear cookies
      if (typeof document !== 'undefined') {
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos) : c;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });
      }
      
      // Clear localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
      
      // Clear sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
      
      // Clear cache
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name);
          });
        });
      }
    } catch (error) {
      logError('Error clearing auth data', error);
    }
  }, []);

  // Handle token expiration
  const handleTokenExpiration = useCallback(() => {
    setAuthState(prev => ({ ...prev, session: null, user: null }));
    clearAuthData();
    toast.error('Sessão expirada. Por favor, faça login novamente.');
    router.push('/auth/signin');
  }, [clearAuthData, router]);

  // Refresh session
  const refreshSession = useCallback(async () => {
    if (authState.isRefreshing) return;
    
    setAuthState(prev => ({ ...prev, isRefreshing: true }));
    
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw error;
      }
      
      if (data.session && data.session.user) {
        const session = data.session;
        setAuthState(prev => ({
          ...prev,
          session,
          user: session.user as AuthUser,
          isRefreshing: false
        }));
      } else {
        // No session returned, handle as expired
        handleTokenExpiration();
      }
    } catch (error) {
      logError('Error refreshing session', error);
      handleTokenExpiration();
    }
  }, [authState.isRefreshing, supabase.auth, handleTokenExpiration]);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
                
        if (error) {
          throw error;
        }
        
        if (session) {
          setAuthState(prev => ({
            ...prev,
            session,
            user: session.user as AuthUser,
            loading: false
          }));
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();
  }, [supabase.auth]);

  // Set up session change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setAuthState(prev => ({
            ...prev,
            session,
            user: session?.user as AuthUser | null,
            loading: false
          }));
        } else if (event === 'SIGNED_OUT') {
          handleTokenExpiration();
        } else if (event === 'INITIAL_SESSION' || event === 'PASSWORD_RECOVERY' || event === 'USER_UPDATED') {
          // Handle other auth events that don't require logout
          if (session) {
            setAuthState(prev => ({
              ...prev,
              session,
              user: session.user as AuthUser,
              loading: false
            }));
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, handleTokenExpiration]);

  // Monitor token expiration
  useEffect(() => {
    if (!authState.session) return;

    const checkTokenExpiration = setInterval(() => {
      if (authState.session?.expires_at) {
        const timeUntilExpiry = authState.session.expires_at - Math.floor(Date.now() / 1000);
        
        // Refresh token 5 minutes before expiration
        if (timeUntilExpiry < 300 && !authState.isRefreshing) {
          refreshSession();
        }
        // Force logout if token is expired
        else if (timeUntilExpiry < 0) {
          handleTokenExpiration();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkTokenExpiration);
  }, [authState.session, authState.isRefreshing, refreshSession, handleTokenExpiration]);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      handleTokenExpiration();
    } catch (error) {
      logError('Error signing out', error);
      handleTokenExpiration();
    }
  }, [supabase.auth, handleTokenExpiration]);

  // Sign in function
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        setAuthState(prev => ({
          ...prev,
          session: data.session,
          user: data.session.user as AuthUser
        }));
        toast.success('Login realizado com sucesso!');
        return { success: true, session: data.session, user: data.session.user, error: null };
      }

      return { success: false, session: null, user: null, error: null };
    } catch (error) {
      logError('Error signing in', error);
      toast.error('Erro ao fazer login. Verifique suas credenciais.');
      return { success: false, session: null, user: null, error };
    }
  }, [supabase.auth]);

  // Sign up function
  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast.success('Cadastro realizado com sucesso!');
        return { success: true, user: data.user };
      }

      return { success: false };
    } catch (error) {
      logError('Error signing up', error);
      toast.error('Erro ao criar conta. Tente novamente.');
      return { success: false, error };
    }
  }, [supabase.auth]);

  return {
    ...authState,
    signOut,
    signIn,
    signUp,
    clearAuthData
  };
};
