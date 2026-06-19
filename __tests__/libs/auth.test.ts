import { ensureUserProfileExists, validateProfileAccess } from '@/libs/auth';

jest.mock('@/libs/verification', () => ({
  incrementLoginAttempts: jest.fn(),
  resetLoginAttempts: jest.fn(),
  isAccountLocked: jest.fn(),
}));

describe('ensureUserProfileExists', () => {
  it('returns false if userId is empty', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockSupabase = { from: jest.fn() };
    const result = await ensureUserProfileExists(mockSupabase as any, '');
    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('ensureUserProfileExists: userId is required');
    consoleSpy.mockRestore();
  });

  it('returns true if profile already exists', async () => {
    const mockSingle = jest.fn().mockResolvedValue({ data: { id: 'p1' }, error: null });
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = jest.fn().mockReturnValue({ select: mockSelect, insert: jest.fn() });
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const result = await ensureUserProfileExists({ from: mockFrom } as any, 'user-1');
    expect(result).toBe(true);
    consoleSpy.mockRestore();
  });

  it('returns false on DB error', async () => {
    const mockSingle = jest.fn().mockResolvedValue({ data: null, error: { code: 'XXXX', message: 'fail' } });
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = jest.fn().mockReturnValue({ select: mockSelect, insert: jest.fn() });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const result = await ensureUserProfileExists({ from: mockFrom } as any, 'user-1');
    expect(result).toBe(false);
    consoleSpy.mockRestore();
  });

  it('handles PGRST116 as "no rows" and continues', async () => {
    const savedKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const mockSingle = jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'no rows' } });
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockLimit = jest.fn().mockResolvedValue({ data: [] });
    const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq, order: mockOrder });
    const mockInsert = jest.fn().mockResolvedValue({ error: { code: '42501', message: 'RLS' } });
    const mockFrom = jest.fn().mockReturnValue({ select: mockSelect, insert: mockInsert });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    const result = await ensureUserProfileExists({ from: mockFrom } as any, 'user-1', 'test@example.com');
    expect(result).toBe(false); // RLS error blocks creation
    consoleSpy.mockRestore();
    if (savedKey) process.env.SUPABASE_SERVICE_ROLE_KEY = savedKey;
  });
});

describe('validateProfileAccess', () => {
  it('returns NONE when profile query throws', async () => {
    const mockSingle = jest.fn().mockRejectedValue(new Error('Network error'));
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const result = await validateProfileAccess({ from: mockFrom } as any, 'user-1');
    expect(result.canAccess).toBe(false);
    expect(result.accessLevel).toBe('NONE');
    consoleSpy.mockRestore();
  });
});

