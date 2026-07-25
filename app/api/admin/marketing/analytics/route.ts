import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/libs/supabase/server';
import type { Database } from '@/types/database';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';
import { cacheOrSet } from '@/libs/cache';

export const dynamic = 'force-dynamic';

// GET - Aggregate marketing engagement metrics (admin only)
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request, new NextResponse());
    if (!auth.ok) return auth.response;
    const { supabase } = auth;

    const data = await cacheOrSet('marketing:analytics', async () => {
      const [campaigns, posts] = await Promise.all([
        supabase.from('marketing_campaigns').select('status'),
        supabase.from('social_media_posts').select('status, platform, engagement_data'),
      ]);

      if (campaigns.error) {
        console.error('Analytics campaigns error:', campaigns.error);
        throw new Error('DATABASE_ERROR');
      }
      if (posts.error) {
        console.error('Analytics posts error:', posts.error);
        throw new Error('DATABASE_ERROR');
      }

      const campaignsRows = (campaigns.data ?? []) as Database['public']['Tables']['marketing_campaigns']['Row'][];
      const postsRows = (posts.data ?? []) as Database['public']['Tables']['social_media_posts']['Row'][];

      const countBy = <T>(rows: T[], key: keyof T): Record<string, number> =>
        rows.reduce((acc, r) => {
          const k = String(r[key] ?? 'unknown');
          acc[k] = (acc[k] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      const sumEngagement = (rows: Database['public']['Tables']['social_media_posts']['Row'][]) =>
        rows.reduce(
          (acc: { likes: number; shares: number; comments: number }, p) => {
            const ed = p.engagement_data || {};
            acc.likes += Number(ed.likes) || 0;
            acc.shares += Number(ed.shares) || 0;
            acc.comments += Number(ed.comments) || 0;
            return acc;
          },
          { likes: 0, shares: 0, comments: 0 }
        );

      const published = postsRows.filter((p) => p.status === 'published');
      const byPlatform: Record<string, { likes: number; shares: number; comments: number }> = {};
      for (const p of published) {
        const plat = p.platform ?? 'unknown';
        const cur = (byPlatform[plat] = byPlatform[plat] || { likes: 0, shares: 0, comments: 0 });
        const ed = p.engagement_data || {};
        cur.likes += Number(ed.likes) || 0;
        cur.shares += Number(ed.shares) || 0;
        cur.comments += Number(ed.comments) || 0;
      }

      return {
        campaigns: { total: campaignsRows.length, byStatus: countBy(campaignsRows, 'status') },
        posts: {
          total: postsRows.length,
          byStatus: countBy(postsRows, 'status'),
          published: published.length,
          byPlatform: countBy(postsRows, 'platform'),
        },
        engagement: { total: sumEngagement(published), byPlatform },
      };
    }, 120);

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Marketing analytics error:', error);
    return NextResponse.json({ error: message, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
