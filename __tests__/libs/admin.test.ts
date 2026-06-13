import { getDashboardStats, getRecentActivity, getAdminUsers, updateUserAdminStatus, deleteReview } from '@/libs/admin';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('admin utilities', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('getDashboardStats', () => {
    it('fetches dashboard stats successfully', async () => {
      const mockData = {
        users: { total: 10, active: 8, newThisMonth: 2, newThisWeek: 1, admins: 1, growthRate: 0.1 },
        restaurants: { total: 50, averageRating: 4.2, newThisMonth: 5, byCuisine: [] },
        reviews: { total: 100, averageRating: 4.0, byRating: [], newThisMonth: 12 },
        lists: { total: 20, public: 15, private: 3, collaborative: 2, totalItems: 80 },
        meals: { total: 30, upcoming: 5, thisMonth: 8 },
        growth: { users: [], restaurants: [], reviews: [] },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockData }),
      });

      const result = await getDashboardStats();
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/stats', { credentials: 'include' });
    });

    it('returns null on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
      const result = await getDashboardStats();
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching dashboard stats:', expect.any(Error));
    });

    it('returns null on fetch exception', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const result = await getDashboardStats();
      expect(result).toBeNull();
    });
  });

  describe('getRecentActivity', () => {
    it('returns empty array (current implementation)', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: {} }) });
      const result = await getRecentActivity(10);
      expect(result).toEqual([]);
    });

    it('returns empty array on fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const result = await getRecentActivity();
      expect(result).toEqual([]);
    });
  });

  describe('getAdminUsers', () => {
    it('fetches admin users successfully', async () => {
      const mockUsers = [{ id: '1', display_name: 'Admin', is_admin: true }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockUsers, total: 1 }),
      });

      const result = await getAdminUsers(1, 20, '');
      expect(result).toEqual({ users: mockUsers, total: 1 });
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/users?page=1&limit=20',
        { credentials: 'include' }
      );
    });

    it('includes search parameter when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      });

      await getAdminUsers(1, 20, 'john');
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/users?page=1&limit=20&search=john',
        { credentials: 'include' }
      );
    });

    it('returns null on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const result = await getAdminUsers();
      expect(result).toBeNull();
    });
  });

  describe('updateUserAdminStatus', () => {
    it('returns true on successful update', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      const result = await updateUserAdminStatus('user-1', true);
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/users/user-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_admin: true }),
        credentials: 'include',
      });
    });

    it('returns false on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      const result = await updateUserAdminStatus('user-1', false);
      expect(result).toBe(false);
    });

    it('returns false on exception', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const result = await updateUserAdminStatus('user-1', true);
      expect(result).toBe(false);
    });
  });

  describe('deleteReview', () => {
    it('returns true on successful deletion', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      const result = await deleteReview('review-1');
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/reviews/review-1', {
        method: 'DELETE',
        credentials: 'include',
      });
    });

    it('returns false on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      const result = await deleteReview('review-1');
      expect(result).toBe(false);
    });

    it('returns false on exception', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const result = await deleteReview('review-1');
      expect(result).toBe(false);
    });
  });
});
