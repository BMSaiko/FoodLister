import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const response = new NextResponse();
    const supabase = await getServerClient(request, response) as any;
    if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('user_id', user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '20');
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: reviews, count, error } = await supabase
      .from('reviews')
      .select('id, restaurant_id, user_id, rating, comment, user_name, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data: reviews, total: count, page, limit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

