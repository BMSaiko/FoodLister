import { getClient } from '@/libs/supabase/client';
import type { VerificationStatus } from '@/libs/types';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

interface ProfileVerification {
  is_verified: boolean | null;
  verified_at: string | null;
  verification_method: string | null;
}

interface ProfileSecurity {
  login_attempts: number | null;
  locked_until: string | null;
}

/**
 * Sends email verification token using Supabase Auth built-in email verification.
 */
export async function sendVerificationEmail(email: string): Promise<{ error: any }> {
  try {
    const supabase = getClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      console.error('Error sending verification email:', error);
      return { error };
    }

    return { error: null };
  } catch (error: any) {
    console.error('Unexpected error sending verification email:', error);
    return { error };
  }
}

/**
 * Verifies email token from the URL.
 */
export async function verifyEmailToken(token: string): Promise<{ success: boolean; error: any }> {
  try {
    const supabase = getClient();
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    });

    if (error) {
      console.error('Error verifying email token:', error);
      return { success: false, error };
    }

    if (data.user) {
      const { error: updateError } = await (supabase as any)
        .from('profiles')
        .update({
          is_verified: true,
          verified_at: new Date().toISOString(),
          verification_method: 'email',
        })
        .eq('user_id', data.user.id);

      if (updateError) {
        console.error('Error updating profile verification status:', updateError);
      }

      return { success: true, error: null };
    }

    return { success: false, error: new Error('No user data returned from token verification') };
  } catch (error: any) {
    console.error('Unexpected error verifying email token:', error);
    return { success: false, error };
  }
}

/**
 * Checks the current user's verification status from their profile.
 */
export async function checkVerificationStatus(userId: string): Promise<VerificationStatus> {
  try {
    const supabase = getClient();
    const { data, error } = await (supabase as any)
      .from('profiles')
      .select('is_verified, verified_at, verification_method')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking verification status:', error?.message || error?.code || 'Unknown error');
      return {
        isVerified: false,
        emailConfirmed: false,
        verifiedAt: null,
        verificationMethod: null,
      };
    }

    // If no profile exists yet, return defaults
    if (!data) {
      return {
        isVerified: false,
        emailConfirmed: false,
        verifiedAt: null,
        verificationMethod: null,
      };
    }

    const profile = data as ProfileVerification;

    return {
      isVerified: profile.is_verified ?? false,
      emailConfirmed: profile.is_verified ?? false,
      verifiedAt: profile.verified_at ?? null,
      verificationMethod: (profile.verification_method as 'email' | null) ?? null,
    };
  } catch (error: any) {
    console.error('Unexpected error checking verification status:', error?.message || error);
    return {
      isVerified: false,
      emailConfirmed: false,
      verifiedAt: null,
      verificationMethod: null,
    };
  }
}

/**
 * Checks if the user account is locked due to too many failed login attempts.
 */
export async function isAccountLocked(userId: string): Promise<{ locked: boolean; lockedUntil: string | null }> {
  try {
    const supabase = getClient();
    const { data, error } = await (supabase as any)
      .from('profiles')
      .select('login_attempts, locked_until')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return { locked: false, lockedUntil: null };
    }

    const profile = data as ProfileSecurity;

    if (profile.locked_until) {
      const lockedUntil = new Date(profile.locked_until);
      if (lockedUntil > new Date()) {
        return { locked: true, lockedUntil: profile.locked_until };
      }
    }

    return { locked: false, lockedUntil: null };
  } catch (error: any) {
    console.error('Error checking account lock status:', error);
    return { locked: false, lockedUntil: null };
  }
}

/**
 * Increments login attempts for a user. Locks account if max attempts exceeded.
 */
export async function incrementLoginAttempts(userId: string): Promise<void> {
  try {
    const supabase = getClient();
    const { data } = await (supabase as any)
      .from('profiles')
      .select('login_attempts')
      .eq('user_id', userId)
      .maybeSingle();

    const profile = data as ProfileSecurity | null;
    const currentAttempts = (profile?.login_attempts ?? 0) + 1;
    const updateData: Record<string, unknown> = {
      login_attempts: currentAttempts,
    };

    if (currentAttempts >= MAX_LOGIN_ATTEMPTS) {
      const lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
      updateData.locked_until = lockUntil.toISOString();
    }

    await (supabase as any)
      .from('profiles')
      .update(updateData)
      .eq('user_id', userId);
  } catch (error: any) {
    console.error('Error incrementing login attempts:', error);
  }
}

/**
 * Resets login attempts after successful login.
 */
export async function resetLoginAttempts(userId: string): Promise<void> {
  try {
    const supabase = getClient();
    await (supabase as any)
      .from('profiles')
      .update({
        login_attempts: 0,
        locked_until: null,
      })
      .eq('user_id', userId);
  } catch (error: any) {
    console.error('Error resetting login attempts:', error);
  }
}

export { MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MINUTES };