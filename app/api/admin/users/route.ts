import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/libs/supabase/server';
import { createAdminClient } from '@/libs/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request, new NextResponse());
    if (!auth.ok) return auth.response;

    // Use admin client to bypass RLS for reading all profiles
    const admin = createAdminClient();
    if (!admin) return NextResponse.json({ error: 'Service role key not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local' }, { status: 500 });

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = admin.from('profiles').select('id, user_id, display_name, avatar_url, is_admin, is_verified, is_active, total_reviews, total_lists, total_restaurants_added, created_at', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);
    if (search) query = query.ilike('display_name', `%${search}%`);

    const { data: users, count, error } = await query;
    if (error) {
      console.error('Admin users route - query error:', error.message || JSON.stringify(error));
      return NextResponse.json({ error: error.message || 'Database error', details: error }, { status: 500 });
    }

    return NextResponse.json({ data: users, total: count, page, limit });
  } catch (error: any) {
    console.error('Admin users route - catch error:', error?.message || error?.code || error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
