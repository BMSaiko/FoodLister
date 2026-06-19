import { renderHook, waitFor } from '@testing-library/react';
import { useAdminStats } from '@/hooks/admin/useAdminStats';

jest.mock('@/libs/admin', () => ({
  getDashboardStats: jest.fn(),
}));

import { getDashboardStats } from '@/libs/admin';

describe('useAdminStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts with loading true', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (getDashboardStats as jest.Mock).mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => useAdminStats());
    expect(result.current.loading).toBe(true);
    expect(result.current.stats).toBeNull();
    consoleSpy.mockRestore();
  });

  it('loads stats successfully', async () => {
    const mockStats = {
      users: { total: 10, active: 8, newThisMonth: 3, newThisWeek: 1, admins: 1, growthRate: 0.5 },
      restaurants: { total: 25, averageRating: 4.2, newThisMonth: 5, byCuisine: [] },
      reviews: { total: 100, averageRating: 4.0, byRating: [], newThisMonth: 10 },
      lists: { total: 15, public: 10, private: 5, collaborative: 3, totalItems: 50 },
      meals: { total: 30, upcoming: 5, thisMonth: 8 },
      growth: { users: [], restaurants: [], reviews: [] },
    };
    (getDashboardStats as jest.Mock).mockResolvedValue(mockStats);
    const { result } = renderHook(() => useAdminStats());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.error).toBeNull();
  });

  it('handles error', async () => {
    (getDashboardStats as jest.Mock).mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useAdminStats());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Network error');
    expect(result.current.stats).toBeNull();
  });
});

