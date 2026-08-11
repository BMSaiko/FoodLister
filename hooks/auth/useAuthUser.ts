'use client';

/**
 * useAuthUser - Single canonical hook for the authenticated user.
 *
 * Consumes AuthContext (the one source of truth), which validates the session
 * via `getUser()` (T35) rather than trusting the local JWT from `getSession()`.
 *
 * Most pages only need `{ user, loading }`. Use this instead of importing the
 * ambiguous duplicated `useAuth` hooks.
 */
import { useAuth } from '@/contexts/AuthContext';
import type { AuthUser } from '@/libs/types';

export interface UseAuthUserResult {
  user: AuthUser | null;
  loading: boolean;
  isValidating: boolean;
}

export function useAuthUser(): UseAuthUserResult {
  const { user, loading, isValidating } = useAuth();
  return { user, loading, isValidating };
}
