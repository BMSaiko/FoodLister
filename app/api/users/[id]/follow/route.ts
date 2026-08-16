import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';

// GET: follower count of [id] + whether current user follows. POST: toggle follow (auth only).
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getServerClient(request, new NextResponse());
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (!supabase) return NextResponse.json({ error: 'Unauthorized', code: 'AUTHENTICATION_ERROR' }, { status: 401 });

  const { count } = await supabase
    .from('user_follows').select('id', { count: 'exact', head: true }).eq('following_id', id);
  let following = false;
  if (user && user.id !== id) {
    const { data } = await supabase.from('user_follows').select('id').eq('follower_id', user.id).eq('following_id', id).maybeSingle();
    following = !!data;
  }
  return NextResponse.json({ followers: count || 0, following });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await getServerClient(request, new NextResponse());
  if (!supabase) return NextResponse.json({ error: 'Authentication required', code: 'AUTHENTICATION_ERROR' }, { status: 401 });
  const { data: { user } } = await supabase.auth.getUser();
  const { id } = await params;
  if (!user) return NextResponse.json({ error: 'Authentication required', code: 'AUTHENTICATION_ERROR' }, { status: 401 });
  if (user.id === id) return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });

  const { data: existing } = await supabase.from('user_follows').select('id').eq('follower_id', user.id).eq('following_id', id).maybeSingle();
  if (existing) {
    await supabase.from('user_follows').delete().eq('id', existing.id);
    const { count } = await supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('following_id', id);
    return NextResponse.json({ followers: count || 0, following: false });
  }
  await supabase.from('user_follows').insert({ follower_id: user.id, following_id: id });
  const { count } = await supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('following_id', id);
  return NextResponse.json({ followers: count || 0, following: true });
}
