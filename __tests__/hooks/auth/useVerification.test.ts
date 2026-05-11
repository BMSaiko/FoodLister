import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react';

jest.mock('@/libs/supabase/client', () => ({
  getClient: jest.fn(),
}));

jest.mock('@/libs/verification', () => ({
  sendVerificationEmail: jest.fn(),
  verifyEmailToken: jest.fn(),
  checkVerificationStatus: jest.fn(),
}));

import { useVerification } from '@/hooks/auth/useVerification';
import { sendVerificationEmail, verifyEmailToken, checkVerificationStatus } from '@/libs/verification';

describe('useVerification', () => {
  const mockSession = {
    user: { id: 'user-123', email: 'test@example.com' },
  };

  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
      },
    };
    const { getClient } = require('@/libs/supabase/client');
    (getClient as any).mockReturnValue(mockSupabase);
    (checkVerificationStatus as any).mockResolvedValue({
      isVerified: false,
      emailConfirmed: false,
      verifiedAt: null,
      verificationMethod: null,
    });
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useVerification());
    expect(result.current.loading).toBe(true);
  });

  it('should load verification status on mount', async () => {
    const { result } = renderHook(() => useVerification());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.status).toEqual({
      isVerified: false,
      emailConfirmed: false,
      verifiedAt: null,
      verificationMethod: null,
    });
  });

  it('should send verification email', async () => {
    (sendVerificationEmail as any).mockResolvedValue({ error: null });

    const { result } = renderHook(() => useVerification());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let sendResult: any;
    await act(async () => {
      sendResult = await result.current.sendEmail('test@example.com');
    });

    expect(sendVerificationEmail).toHaveBeenCalledWith('test@example.com');
    expect(sendResult.error).toBeNull();
  });

  it('should handle send email error', async () => {
    const mockError = { message: 'Send failed' };
    (sendVerificationEmail as any).mockResolvedValue({ error: mockError });

    const { result } = renderHook(() => useVerification());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.sendEmail('test@example.com');
    });

    expect(result.current.error).toBe('Send failed');
  });

  it('should verify email token', async () => {
    (verifyEmailToken as any).mockResolvedValue({ success: true, error: null });

    const { result } = renderHook(() => useVerification());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let verifyResult: any;
    await act(async () => {
      verifyResult = await result.current.verifyEmail('valid-token');
    });

    expect(verifyEmailToken).toHaveBeenCalledWith('valid-token');
    expect(verifyResult.success).toBe(true);
  });

  it('should handle verify email error', async () => {
    const mockError = { message: 'Invalid token' };
    (verifyEmailToken as any).mockResolvedValue({ success: false, error: mockError });

    const { result } = renderHook(() => useVerification());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.verifyEmail('invalid-token');
    });

    expect(result.current.error).toBe('Invalid token');
  });

  it('should refresh status', async () => {
    const { result } = renderHook(() => useVerification());

    await waitFor(() => expect(result.current.loading).toBe(false));

    (checkVerificationStatus as any).mockResolvedValue({
      isVerified: true,
      emailConfirmed: true,
      verifiedAt: '2024-01-01T00:00:00Z',
      verificationMethod: 'email',
    });

    await act(async () => {
      await result.current.refreshStatus();
    });

    expect(result.current.status).toEqual({
      isVerified: true,
      emailConfirmed: true,
      verifiedAt: '2024-01-01T00:00:00Z',
      verificationMethod: 'email',
    });
  });
});