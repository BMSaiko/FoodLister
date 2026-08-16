import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { resolveListId } from '@/libs/slug';

// GET: like count + whether current user liked. POST: toggle like (auth only).
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getServerClient(request, new NextResponse());
  const listId = (await resolveListId(supabase, id)) ?? id;
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (!supabase) return NextResponse.json({ error: 'Unauthorized', code: 'AUTHENTICATION_ERROR' }, { status: 401 });
  const { count } = await supabase
    .from('list_likes').select('id', { count: 'exact', head: true }).eq('list_id', listId);
  let liked = false;
  if (user) {
    const { data } = await supabase.from('list_likes').select('id').eq('list_id', listId).eq('user_id', user.id).maybeSingle();
    liked = !!data;
  }
  return NextResponse.json({ count: count || 0, liked });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await getServerClient(request, new NextResponse());
  if (!supabase) return NextResponse.json({ error: 'Authentication required', code: 'AUTHENTICATION_ERROR' }, { status: 401 });
  const { data: { user } } = await supabase.auth.getUser();
  const { id } = await params;
  const listId = (await resolveListId(supabase, id)) ?? id;
  if (!user) return NextResponse.json({ error: 'Authentication required', code: 'AUTHENTICATION_ERROR' }, { status: 401 });

  const { data: existing } = await supabase.from('list_likes').select('id').eq('list_id', listId).eq('user_id', user.id).maybeSingle();
  if (existing) {
    await supabase.from('list_likes').delete().eq('id', existing.id);
    const { count } = await supabase.from('list_likes').select('id', { count: 'exact', head: true }).eq('list_id', listId);
    return NextResponse.json({ count: count || 0, liked: false });
  }
  await supabase.from('list_likes').insert({ list_id: listId, user_id: user.id });
  const { count } = await supabase.from('list_likes').select('id', { count: 'exact', head: true }).eq('list_id', listId);
  return NextResponse.json({ count: count || 0, liked: true });
}
