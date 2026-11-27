import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

const getSession = jest.fn(() => Promise.resolve({ data: { session: { access_token: 'tok' } } }));
const supabaseMock = {
  auth: {
    getUser: jest.fn(() => Promise.resolve({ data: { user: null } })),
    getSession,
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  },
};

jest.mock('@/libs/supabase/client', () => ({ getClient: () => supabaseMock }));
jest.mock('@/libs/verification', () => ({
  checkVerificationStatus: jest.fn(() => Promise.resolve(null)),
  sendVerificationEmail: jest.fn(),
  resetLoginAttempts: jest.fn(),
}));
jest.mock('react-toastify', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

describe('AuthContext.getAccessToken', () => {
  it('mantém a identidade entre renders', async () => {
    const { result, rerender } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));
    const first = result.current.getAccessToken;
    rerender();
    await act(async () => { await Promise.resolve(); });
    expect(result.current.getAccessToken).toBe(first);
  });

  it('devolve o access_token da sessão', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await expect(result.current.getAccessToken()).resolves.toBe('tok');
  });
});
