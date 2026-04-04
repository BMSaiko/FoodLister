/**
 * useSession - Hook for session state management
 * Provides session data, loading state, and session checking
 */

import { useState, useEffect, useCallback } from 'react';
import { getClient } from '@/libs/supabase/client';
import { AuthUser, SupabaseAuthSession } from '@/libs/types';

interface SessionState {
  session: SupabaseAuthSession | null;
  user: AuthUser | null;
  loading: boolean;
}

export function useSession() {
  const [sessionState, setSessionState] = useState<SessionState>({
    session: null,
    user: null,
    loading: true
  });

  const supabase = getClient();

  // Initialize session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session) {
          setSessionState({
            session,
            user: session.user as AuthUser,
            loading: false
          });
        } else {
          setSessionState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error initializing session:', error);
        setSessionState(prev => ({ ...prev, loading: false }));
      }
    };

    initializeSession();
  }, [supabase.auth]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          setSessionState({
            session,
            user: session?.user as AuthUser | null,
            loading: false
          });
        } else if (event === 'SIGNED_OUT') {
          setSessionState({
            session: null,
            user: null,
            loading: false
          });
        } else if (event === 'INITIAL_SESSION') {
          if (session) {
            setSessionState({
              session,
              user: session.user as AuthUser,
              loading: false
            });
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const isAuthenticated = !!sessionState.session;

  return {
    ...sessionState,
    isAuthenticated
  };
}