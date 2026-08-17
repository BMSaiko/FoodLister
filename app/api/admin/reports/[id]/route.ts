// T48 — PATCH /api/admin/reports/[id] : resolve/dismiss (admin).
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/libs/supabase/server';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request, new NextResponse());
  if (!auth.ok) return auth.response;

  const { id } = await params;
  let body: any = {};
  try { body = await request.json(); } catch { /* empty */ }

  if (!['resolved', 'dismissed'].includes(body.status)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from('reports')
    .update({ status: body.status })
    .eq('id', id);

  if (error) {
    console.error('Admin report update error:', error.message || error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
