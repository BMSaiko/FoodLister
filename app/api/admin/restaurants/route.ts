import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { createAdminClient } from '@/libs/supabase/admin';
export async function GET(request: NextRequest) {
  try {
    const supabase = await getServerClient(request, new NextResponse()) as any;
    if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { data: profile, error: pe } = await supabase.from('profiles').select('is_admin').eq('user_id', user.id).single();
    if (pe) console.error('Admin restaurants - profile error:', pe.message || pe);
    if (!profile?.is_admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    const admin = createAdminClient();
    if (!admin) return NextResponse.json({ error: 'Service role key not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local' }, { status: 500 });
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '20');
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    let { data: restaurants, count, error } = await admin.from('restaurants').select('id, name, description, rating, created_at, creator_name, review_count', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);
    // Fallback: retry without review_count if migration 020 not applied
    if (error && error.code === '42703') {
      console.warn('Admin restaurants: review_count missing (migration 020 not applied):', error.message);
      const fallback = await admin.from('restaurants').select('id, name, description, rating, created_at, creator_name', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);
      restaurants = fallback.data?.map((r: any) => ({ ...r, review_count: 0 })) || null;
      count = fallback.count;
      error = fallback.error;
    }
    if (error) { console.error('Admin restaurants - query error:', error.message || error); return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 }); }
    return NextResponse.json({ data: restaurants, total: count, page, limit });
  } catch (error: any) {
    console.error('Admin restaurants - catch:', error.message || error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
