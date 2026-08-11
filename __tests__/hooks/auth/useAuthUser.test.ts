import { renderHook } from '@testing-library/react';
import { useAuthUser } from '@/hooks/auth/useAuthUser';

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  user_metadata: { display_name: 'Test' },
};

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from '@/contexts/AuthContext';

describe('useAuthUser', () => {
  const mockUseAuth = useAuth as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the user, loading and isValidating from AuthContext', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      isValidating: false,
    });

    const { result } = renderHook(() => useAuthUser());

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
    expect(result.current.isValidating).toBe(false);
  });

  it('surfaces the loading state while auth is initializing', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      isValidating: false,
    });

    const { result } = renderHook(() => useAuthUser());

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('surfaces the isValidating state during server-side re-validation', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      isValidating: true,
    });

    const { result } = renderHook(() => useAuthUser());

    expect(result.current.isValidating).toBe(true);
  });

  it('returns null user when unauthenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      isValidating: false,
    });

    const { result } = renderHook(() => useAuthUser());

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
