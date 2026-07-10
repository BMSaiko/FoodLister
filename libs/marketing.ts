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
  posts: { total: number; byStatus: Record<string, number>; published: number; byPlatform: Record<string, number> };
  engagement: { total: EngagementTotals; byPlatform: Record<string, EngagementTotals> };
}

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: CampaignStatus;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  target_platforms: string[] | null;
  created_at: string;
  updated_at: string | null;
}

const ANALYTICS_API = '/api/admin/marketing/analytics';
const CAMPAIGNS_API = '/api/marketing/campaigns';

/** Fetch aggregated marketing engagement metrics (admin only). */
export async function getMarketingAnalytics(): Promise<MarketingAnalytics | null> {
  try {
    const res = await fetch(ANALYTICS_API, { credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to fetch marketing analytics: ${res.status}`);
    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching marketing analytics:', error);
    return null;
  }
}

/** List the current user's campaigns. */
export async function getCampaigns(): Promise<Campaign[] | null> {
  try {
    const res = await fetch(CAMPAIGNS_API, { credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to fetch campaigns: ${res.status}`);
    const { data } = await res.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return null;
  }
}

/** Create a campaign. */
export async function createCampaign(input: Partial<Campaign>): Promise<Campaign | null> {
  try {
    const res = await fetch(CAMPAIGNS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Failed to create campaign: ${res.status}`);
    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error('Error creating campaign:', error);
    return null;
  }
}

/** Update a campaign. */
export async function updateCampaign(id: string, input: Partial<Campaign>): Promise<Campaign | null> {
  try {
    const res = await fetch(`${CAMPAIGNS_API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Failed to update campaign: ${res.status}`);
    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error('Error updating campaign:', error);
    return null;
  }
}

/** Delete a campaign. */
export async function deleteCampaign(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${CAMPAIGNS_API}/${id}`, { method: 'DELETE', credentials: 'include' });
    return res.ok;
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return false;
  }
}
