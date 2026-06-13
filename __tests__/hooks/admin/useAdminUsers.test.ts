import { renderHook, waitFor } from '@testing-library/react';
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';

jest.mock('@/libs/admin', () => ({
  getAdminUsers: jest.fn(),
}));

import { getAdminUsers } from '@/libs/admin';

describe('useAdminUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts with loading true', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (getAdminUsers as jest.Mock).mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => useAdminUsers());
    expect(result.current.loading).toBe(true);
    expect(result.current.users).toEqual([]);
    expect(result.current.total).toBe(0);
    (console.error as jest.Mock).mockRestore();
  });

  it('loads users successfully', async () => {
    const mockUsers = [
      { id: '1', user_id: 'u1', display_name: 'Admin User', is_admin: true },
      { id: '2', user_id: 'u2', display_name: 'Regular User', is_admin: false },
    ];
    (getAdminUsers as jest.Mock).mockResolvedValue({ users: mockUsers, total: 2 });

    const { result } = renderHook(() => useAdminUsers());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.users).toEqual(mockUsers);
    expect(result.current.total).toBe(2);
    expect(result.current.error).toBeNull();
  });

  it('handles error', async () => {
    (getAdminUsers as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAdminUsers());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Network error');
    expect(result.current.users).toEqual([]);
  });

  it('handles null response', async () => {
    (getAdminUsers as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useAdminUsers());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.users).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it('accepts page and limit params', async () => {
    (getAdminUsers as jest.Mock).mockResolvedValue({ users: [], total: 0 });

    const { result } = renderHook(() => useAdminUsers(2, 10));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getAdminUsers).toHaveBeenCalledWith(2, 10, '');
  });

  it('accepts search param', async () => {
    (getAdminUsers as jest.Mock).mockResolvedValue({ users: [], total: 0 });

    renderHook(() => useAdminUsers(1, 20, 'john'));

    await waitFor(() => expect(getAdminUsers).toHaveBeenCalledWith(1, 20, 'john'));

    expect(getAdminUsers).toHaveBeenCalledWith(1, 20, 'john');
  });

  it('refresh calls fetchUsers again', async () => {
    (getAdminUsers as jest.Mock).mockResolvedValue({ users: [], total: 0 });

    const { result } = renderHook(() => useAdminUsers());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getAdminUsers).toHaveBeenCalledTimes(1);

    await result.current.refresh();

    expect(getAdminUsers).toHaveBeenCalledTimes(2);
  });
});

