// app/api/analytics/events/route.ts
// ponytail: single ingestion endpoint for user-behavior events (T32).
// requireUser auth; inserts own row. Fire-and-forget from client (keepalive).
import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/libs/supabase/server';

export async function POST(request: NextRequest) {
  const auth = await requireUser(request, new NextResponse());
  if (!auth.ok) return auth.response;

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON body', code: 'VALIDATION_ERROR' }, { status: 400 });
  }
  const { event, metadata } = body;
  // ponytail: enum in utils/analytics.ts is the catalog; here just sanity-check.
  if (typeof event !== 'string' || event.length < 1 || event.length > 64) {
    return NextResponse.json({ error: 'Invalid event', code: 'VALIDATION_ERROR' }, { status: 400 });
  }
  const { error } = await auth.supabase
    .from('user_events')
    .insert({ user_id: auth.user.id, event, metadata: metadata ?? {} });

  if (error) {
    console.error('analytics event insert failed:', error);
    return NextResponse.json({ error: 'Database error', code: 'DATABASE_ERROR' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
