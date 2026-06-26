import { useState, useEffect, useCallback } from 'react';

interface AdminUserDetail {
  id: string;
  userIdCode?: string;
  name: string | null;
  email?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  location?: string | null;
  phoneNumber?: string | null;
  website?: string | null;
  isVerified?: boolean;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface UserStats {
  totalReviews: number;
  totalLists: number;
}

interface UserDetailState {
  user: AdminUserDetail | null;
  stats: UserStats | null;
  recentReviews: any[];
  recentLists: any[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAdminUserDetail(userId: string): UserDetailState {
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [recentLists, setRecentLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/users/${userId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch user detail');
      }

      const data = await response.json();
      setUser(data.user);
      setStats(data.stats);
      setRecentReviews(data.recentReviews);
      setRecentLists(data.recentLists);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching user detail';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId, fetchUser]);

  return { user, stats, recentReviews, recentLists, loading, error, refresh: fetchUser };
}
