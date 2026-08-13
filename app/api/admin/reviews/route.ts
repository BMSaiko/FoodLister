import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/libs/supabase/server';
import { createAdminClient } from '@/libs/supabase/admin';
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request, new NextResponse());
    if (!auth.ok) return auth.response;
    const admin = createAdminClient();
    if (!admin) return NextResponse.json({ error: 'Service role key not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local' }, { status: 500 });
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '20');
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const search = searchParams.get('search') || '';
    let query = admin.from('reviews').select('id, restaurant_id, user_id, rating, comment, user_name, created_at, restaurants(name, images, display_image_index)', { count: 'exact'});
    if (search) {
      query = query.or('user_name.ilike.%${search}%,comment.ilike.%${search}%');
    }
    const { data: reviews, count, error } = await query.order('created_at', { ascending: false }).range(from, to);
    if (error) { console.error('Admin reviews - query error:', error.message || error); return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 }); }
    return NextResponse.json({ data: reviews, total: count, page, limit });
  } catch (error: any) {
    console.error('Admin reviews - catch:', error.message || error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
