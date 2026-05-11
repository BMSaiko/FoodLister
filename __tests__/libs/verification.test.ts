import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock the supabase client
jest.mock('@/libs/supabase/client', () => ({
  getClient: jest.fn(),
}));

import {
  sendVerificationEmail,
  verifyEmailToken,
  checkVerificationStatus,
  isAccountLocked,
  incrementLoginAttempts,
  resetLoginAttempts,
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION_MINUTES,
} from '@/libs/verification';

describe('verification utilities', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        resend: jest.fn(),
        verifyOtp: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      update: jest.fn().mockReturnThis(),
    };
    const { getClient } = require('@/libs/supabase/client');
    (getClient as any).mockReturnValue(mockSupabase);
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email successfully', async () => {
      mockSupabase.auth.resend.mockResolvedValue({ error: null });

      const result = await sendVerificationEmail('test@example.com');

      expect(result.error).toBeNull();
      expect(mockSupabase.auth.resend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'test@example.com',
      });
    });

    it('should return error when send fails', async () => {
      const mockError = { message: 'Failed to send' };
      mockSupabase.auth.resend.mockResolvedValue({ error: mockError });

      const result = await sendVerificationEmail('test@example.com');

      expect(result.error).toEqual(mockError);
    });
  });

  describe('verifyEmailToken', () => {
    it('should verify email token successfully', async () => {
      mockSupabase.auth.verifyOtp.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      mockSupabase.update.mockResolvedValue({ error: null });

      const result = await verifyEmailToken('valid-token');

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should return error for invalid token', async () => {
      const mockError = { message: 'Invalid token' };
      mockSupabase.auth.verifyOtp.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await verifyEmailToken('invalid-token');

      expect(result.success).toBe(false);
      expect(result.error).toEqual(mockError);
    });
  });

  describe('checkVerificationStatus', () => {
    it('should return verified status for verified user', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          is_verified: true,
          verified_at: '2024-01-01T00:00:00Z',
          verification_method: 'email',
        },
        error: null,
      });

      const result = await checkVerificationStatus('user-123');

      expect(result.isVerified).toBe(true);
      expect(result.emailConfirmed).toBe(true);
      expect(result.verifiedAt).toBe('2024-01-01T00:00:00Z');
      expect(result.verificationMethod).toBe('email');
    });

    it('should return unverified status for unverified user', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          is_verified: false,
          verified_at: null,
          verification_method: null,
        },
        error: null,
      });

      const result = await checkVerificationStatus('user-123');

      expect(result.isVerified).toBe(false);
      expect(result.emailConfirmed).toBe(false);
    });

    it('should return default status on error', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await checkVerificationStatus('user-123');

      expect(result.isVerified).toBe(false);
      expect(result.emailConfirmed).toBe(false);
      expect(result.verifiedAt).toBeNull();
      expect(result.verificationMethod).toBeNull();
    });
  });

  describe('isAccountLocked', () => {
    it('should return locked when lock date is in the future', async () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      mockSupabase.single.mockResolvedValue({
        data: { login_attempts: 5, locked_until: futureDate },
        error: null,
      });

      const result = await isAccountLocked('user-123');

      expect(result.locked).toBe(true);
      expect(result.lockedUntil).toBe(futureDate);
    });

    it('should return not locked when lock date is in the past', async () => {
      const pastDate = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      mockSupabase.single.mockResolvedValue({
        data: { login_attempts: 5, locked_until: pastDate },
        error: null,
      });

      const result = await isAccountLocked('user-123');

      expect(result.locked).toBe(false);
    });

    it('should return not locked when no lock date', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { login_attempts: 0, locked_until: null },
        error: null,
      });

      const result = await isAccountLocked('user-123');

      expect(result.locked).toBe(false);
      expect(result.lockedUntil).toBeNull();
    });
  });

  describe('incrementLoginAttempts', () => {
    it('should increment login attempts', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { login_attempts: 2 },
        error: null,
      });
      mockSupabase.update.mockResolvedValue({ error: null });

      await incrementLoginAttempts('user-123');

      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({ login_attempts: 3 })
      );
    });

    it('should lock account when max attempts reached', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { login_attempts: MAX_LOGIN_ATTEMPTS - 1 },
        error: null,
      });
      mockSupabase.update.mockResolvedValue({ error: null });

      await incrementLoginAttempts('user-123');

      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          login_attempts: MAX_LOGIN_ATTEMPTS,
          locked_until: expect.any(String),
        })
      );
    });
  });

  describe('resetLoginAttempts', () => {
    it('should reset login attempts and lock', async () => {
      mockSupabase.update.mockResolvedValue({ error: null });

      await resetLoginAttempts('user-123');

      expect(mockSupabase.update).toHaveBeenCalledWith({
        login_attempts: 0,
        locked_until: null,
      });
    });
  });

  describe('constants', () => {
    it('should have correct MAX_LOGIN_ATTEMPTS', () => {
      expect(MAX_LOGIN_ATTEMPTS).toBe(5);
    });

    it('should have correct LOCKOUT_DURATION_MINUTES', () => {
      expect(LOCKOUT_DURATION_MINUTES).toBe(15);
    });
  });
});