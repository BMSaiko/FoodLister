// T48 — GET /api/admin/reports : fila de reports (admin).
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/libs/supabase/server';

const TYPE_TABLE: Record<string, { table: string; name_field: string }> = {
  restaurant: { table: 'restaurants', name_field: 'name' },
  review:     { table: 'reviews',     name_field: 'comment' },
  list:       { table: 'lists',       name_field: 'name' },
  profile:    { table: 'profiles',    name_field: 'display_name' },
};

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, new NextResponse());
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'pending';

  const { data, error } = await auth.supabase
    .from('reports')
    .select('id, target_type, target_id, reason, details, status, created_at, profiles(display_name)')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Admin reports list error:', error.message || error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }

  const items = [];
  for (const r of data || []) {
    const meta = TYPE_TABLE[r.target_type];
    let target = null;
    if (meta) {
      const { data: row } = await auth.supabase
        .from(meta.table)
        .select(meta.name_field)
        .eq('id', r.target_id)
        .maybeSingle();
      target = row ? (row as any)[meta.name_field] : '';
    }
    items.push({ ...r, target });
  }

  return NextResponse.json({ data: items });
}
