import { renderHook, act, waitFor } from '@testing-library/react';

const mockSendVerificationEmail = jest.fn();
const mockVerifyEmailToken = jest.fn();
const mockCheckVerificationStatus = jest.fn();

jest.mock('@/libs/supabase/client', () => ({
  getClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => Promise.resolve({
        data: { session: { user: { id: 'user-123', email: 'test@example.com' } } },
      })),
    },
  })),
}));

jest.mock('@/libs/verification', () => ({
  sendVerificationEmail: (...args: any[]) => mockSendVerificationEmail(...args),
  verifyEmailToken: (...args: any[]) => mockVerifyEmailToken(...args),
  checkVerificationStatus: (...args: any[]) => mockCheckVerificationStatus(...args),
}));

import { useVerification } from '@/hooks/auth/useVerification';

const defaultStatus = {
  isVerified: false,
  emailConfirmed: false,
  verifiedAt: null,
  verificationMethod: null,
} as const;

describe('useVerification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckVerificationStatus.mockResolvedValue({ ...defaultStatus });
  });

  it('should initialize with loading state', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockCheckVerificationStatus.mockImplementationOnce(() => new Promise(() => {}));
    const { result } = renderHook(() => useVerification());
    expect(result.current.loading).toBe(true);
    consoleSpy.mockRestore();
  });

  it('should load verification status on mount', async () => {
    const { result } = renderHook(() => useVerification());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.status).toEqual(defaultStatus);
  });

  it('should send verification email', async () => {
    mockSendVerificationEmail.mockResolvedValueOnce({ error: null });
    const { result } = renderHook(() => useVerification());
    await waitFor(() => expect(result.current.loading).toBe(false));
    let sendResult: any;
    await act(async () => { sendResult = await result.current.sendEmail('test@example.com'); });
    expect(mockSendVerificationEmail).toHaveBeenCalledWith('test@example.com');
    expect(sendResult.error).toBeNull();
  });

  it('should handle send email error', async () => {
    mockSendVerificationEmail.mockResolvedValueOnce({ error: { message: 'Send failed' } });
    const { result } = renderHook(() => useVerification());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.sendEmail('test@example.com'); });
    expect(result.current.error).toBe('Send failed');
  });

  it('should verify email token', async () => {
    mockVerifyEmailToken.mockResolvedValueOnce({ success: true, error: null });
    const { result } = renderHook(() => useVerification());
    await waitFor(() => expect(result.current.loading).toBe(false));
    let verifyResult: any;
    await act(async () => { verifyResult = await result.current.verifyEmail('valid-token'); });
    expect(mockVerifyEmailToken).toHaveBeenCalledWith('valid-token');
    expect(verifyResult.success).toBe(true);
  });

  it('should handle verify email error', async () => {
    mockVerifyEmailToken.mockResolvedValueOnce({ success: false, error: { message: 'Invalid token' } });
    const { result } = renderHook(() => useVerification());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.verifyEmail('invalid-token'); });
    expect(result.current.error).toBe('Invalid token');
  });

  it('should refresh status', async () => {
    const { result } = renderHook(() => useVerification());
    await waitFor(() => expect(result.current.loading).toBe(false));
    mockCheckVerificationStatus.mockResolvedValueOnce({
      isVerified: true,
      emailConfirmed: true,
      verifiedAt: '2024-01-01T00:00:00Z',
      verificationMethod: 'email',
    });
    await act(async () => { await result.current.refreshStatus(); });
    expect(result.current.status).toEqual({
      isVerified: true,
      emailConfirmed: true,
      verifiedAt: '2024-01-01T00:00:00Z',
      verificationMethod: 'email',
    });
  });
});
