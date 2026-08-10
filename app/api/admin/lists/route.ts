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

    let query = admin.from('lists').select('id, name, description, is_public, creator_name, created_at', { count: 'exact' });
    if (search) {
      query = query.or(`name.ilike.%${search}%`);
    }
    const { data: lists, count, error } = await query.order('created_at', { ascending: false }).range(from, to);
    if (error) {
      console.error('Admin lists - query error:', error.message || error);
      return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
    }
    return NextResponse.json({ data: lists, total: count, page, limit });
  } catch (error: any) {
    console.error('Admin lists - catch:', error.message || error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
