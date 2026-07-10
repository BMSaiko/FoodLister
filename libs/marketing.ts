/**
 * Marketing utility functions for the admin marketing dashboard.
 */
export interface EngagementTotals {
  likes: number;
  shares: number;
  comments: number;
}

export interface MarketingAnalytics {
  campaigns: { total: number; byStatus: Record<string, number> };
  posts: { total: number; byStatus: Record<string, number>; published: number };
  engagement: { total: EngagementTotals; byPlatform: Record<string, EngagementTotals> };
}

/** Fetch aggregated marketing engagement metrics (admin only). */
export async function getMarketingAnalytics(): Promise<MarketingAnalytics | null> {
  try {
    const res = await fetch('/api/admin/marketing/analytics', { credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to fetch marketing analytics: ${res.status}`);
    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching marketing analytics:', error);
    return null;
  }
}
