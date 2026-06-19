jest.mock('@/libs/supabase/client', () => ({
  getClient: jest.fn(() => mockSupabase),
}));

let mockSupabase: any;

jest.mock('@/libs/types', () => ({}));

import { sendVerificationEmail, verifyEmailToken, checkVerificationStatus } from '@/libs/verification';

describe('verification', () => {
  beforeEach(() => {
    mockSupabase = {
      auth: {
        resend: jest.fn(() => Promise.resolve({ error: null })),
        verifyOtp: jest.fn(() => Promise.resolve({ data: { user: { id: 'user-123' } }, error: null })),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn(() => Promise.resolve({
              data: { is_verified: false, verified_at: null, verification_method: null },
              error: null,
            })),
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
      })),
    };
    jest.clearAllMocks();
  });

  describe('sendVerificationEmail', () => {
    it('sends verification email successfully', async () => {
      const result = await sendVerificationEmail('test@example.com');
      expect(result.error).toBeNull();
      expect(mockSupabase.auth.resend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'test@example.com',
      });
    });

    it('returns error when send fails', async () => {
      mockSupabase.auth.resend.mockResolvedValueOnce({ error: { message: 'Send failed' } });
      const result = await sendVerificationEmail('test@example.com');
      expect(result.error).toBeDefined();
    });
  });

  describe('verifyEmailToken', () => {
    it('verifies token successfully', async () => {
      const result = await verifyEmailToken('valid-token');
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it('returns error when verification fails', async () => {
      mockSupabase.auth.verifyOtp.mockResolvedValueOnce({ data: null, error: { message: 'Invalid' } });
      const result = await verifyEmailToken('bad-token');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('checkVerificationStatus', () => {
    it('returns verification status', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn(() => Promise.resolve({
              data: { is_verified: true, verified_at: '2024-01-01', verification_method: 'email' },
              error: null,
            })),
          })),
        })),
      });
      const result = await checkVerificationStatus('user-123');
      expect(result.isVerified).toBe(true);
      expect(result.emailConfirmed).toBe(true);
      expect(result.verificationMethod).toBe('email');
    });

    it('returns defaults when no profile', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      });
      const result = await checkVerificationStatus('user-123');
      expect(result.isVerified).toBe(false);
      expect(result.emailConfirmed).toBe(false);
      expect(result.verifiedAt).toBeNull();
    });

    it('returns defaults on error', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: { message: 'DB error' } })),
          })),
        })),
      });
      const result = await checkVerificationStatus('user-123');
      expect(result.isVerified).toBe(false);
    });
  });
});
