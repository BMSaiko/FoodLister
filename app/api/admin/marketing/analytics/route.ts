import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';

export const dynamic = 'force-dynamic';

// GET - Aggregate marketing engagement metrics (admin only)
export async function GET(request: NextRequest) {
  try {
    const response = new NextResponse();
    const supabase = (await getServerClient(request, response)) as any;
    if (!supabase) {
      return NextResponse.json({ error: getErrorMessage('AUTHENTICATION_ERROR'), code: 'AUTHENTICATION_ERROR' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: getErrorMessage('AUTHENTICATION_ERROR'), code: 'AUTHENTICATION_ERROR' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();
    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Admin access required', code: 'FORBIDDEN' }, { status: 403 });
    }

    const [campaigns, posts] = await Promise.all([
      supabase.from('marketing_campaigns').select('status'),
      supabase.from('social_media_posts').select('status, platform, engagement_data'),
    ]);

    if (campaigns.error) {
      console.error('Analytics campaigns error:', campaigns.error);
      return NextResponse.json({ error: getErrorMessage('DATABASE_ERROR' as ApiErrorType), code: 'DATABASE_ERROR' }, { status: 500 });
    }
    if (posts.error) {
      console.error('Analytics posts error:', posts.error);
      return NextResponse.json({ error: getErrorMessage('DATABASE_ERROR' as ApiErrorType), code: 'DATABASE_ERROR' }, { status: 500 });
    }

    const campaignsRows = (campaigns.data as any[]) || [];
    const postsRows = (posts.data as any[]) || [];

    const countBy = (rows: any[], key: string): Record<string, number> =>
      rows.reduce((acc: Record<string, number>, r: any) => {
        const k = r[key] ?? 'unknown';
        acc[k] = (acc[k] || 0) + 1;
        return acc;
      }, {});

    const sumEngagement = (rows: any[]) =>
      rows.reduce(
        (acc: { likes: number; shares: number; comments: number }, p: any) => {
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

    const data = {
      campaigns: { total: campaignsRows.length, byStatus: countBy(campaignsRows, 'status') },
      posts: {
        total: postsRows.length,
        byStatus: countBy(postsRows, 'status'),
        published: published.length,
        byPlatform: countBy(postsRows, 'platform'),
      },
      engagement: { total: sumEngagement(published), byPlatform },
    };

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Marketing analytics error:', error?.message || error?.code || error);
    return NextResponse.json({ error: error.message || 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
