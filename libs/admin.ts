/**
 * Admin utility functions for dashboard statistics and management
 * These functions aggregate data from Supabase for the admin dashboard
 */
import type { DashboardStats, RecentActivity, AdminUser } from '@/libs/types';

const API_BASE = '/api/admin';

/**
 * Fetch all dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats | null> {
  try {
    const res = await fetch(`${API_BASE}/stats`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to fetch stats: ${res.status}`);
    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
}

/**
 * Fetch recent activity across the platform
 */
export async function getRecentActivity(limit = 10): Promise<RecentActivity[]> {
  try {
    // We'll build recent activity from the latest records across tables
    const res = await fetch(`${API_BASE}/stats`, { credentials: 'include' });
    if (!res.ok) return [];
    // For now, return empty - can be enhanced with a dedicated activity endpoint
    return [];
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

/**
 * Fetch admin users list
 */
export async function getAdminUsers(page = 1, limit = 20, search = ''): Promise<{ users: AdminUser[]; total: number } | null> {
  try {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    const res = await fetch(`${API_BASE}/users?${params}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
    const { data, total } = await res.json();
    return { users: data, total };
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return null;
  }
}

/**
 * Update user admin status
 */
export async function updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_admin: isAdmin }),
      credentials: 'include',
    });
    return res.ok;
  } catch (error) {
    console.error('Error updating user admin status:', error);
    return false;
  }
}

/**
 * Delete a review (moderation)
 */
export async function deleteReview(reviewId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/reviews/${reviewId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return res.ok;
  } catch (error) {
    console.error('Error deleting review:', error);
    return false;
  }
}

