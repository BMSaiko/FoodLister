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
    if (pe) console.error('Admin reviews - profile error:', pe.message || pe);
    if (!profile?.is_admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    const admin = createAdminClient();
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '20');
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data: reviews, count, error } = await admin.from('reviews').select('id, restaurant_id, user_id, rating, comment, user_name, created_at', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);
    if (error) { console.error('Admin reviews - query error:', error.message || error); return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 }); }
    return NextResponse.json({ data: reviews, total: count, page, limit });
  } catch (error: any) {
    console.error('Admin reviews - catch:', error.message || error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}