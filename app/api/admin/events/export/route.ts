import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/libs/supabase/server';
import { createAdminClient } from '@/libs/supabase/admin';

function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, new NextResponse());
  if (!auth.ok) return auth.response;

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: 'Server misconfigured', code: 'CONFIG_ERROR' }, { status: 500 });

  const sp = request.nextUrl.searchParams;
  const from = sp.get('from');
  const to = sp.get('to');
  // default: last 30 days; validate ISO-ish inputs
  const fromIso = from && !Number.isNaN(Date.parse(from)) ? new Date(from).toISOString() : new Date(Date.now() - 30*24*60*60*1000).toISOString();
  const toIso = to && !Number.isNaN(Date.parse(to)) ? new Date(to).toISOString() : new Date().toISOString();

  // ponytail: paginated service-role read, 1k per batch (no cache — CSV is a fresh snapshot)
  const headers = ['event','user_id','created_at','metadata'];
  const rows: string[] = [headers.join(',')];
  const BATCH = 1000;
  for (let fromRow = 0; ; fromRow += BATCH) {
    const { data, error } = await admin.from('user_events')
      .select('event,user_id,created_at,metadata')
      .gte('created_at', fromIso)
      .lte('created_at', toIso)
      .order('created_at',{ascending:true})
      .range(fromRow, fromRow + BATCH - 1);
    if (error) return NextResponse.json({ error: error.message, code: 'DATABASE_ERROR' }, { status: 500 });
    for (const e of data || []) {
      rows.push([csvCell(e.event), csvCell(e.user_id), csvCell(e.created_at), csvCell(JSON.stringify(e.metadata ?? {}))].join(','));
    }
    if (!data || data.length < BATCH) break;
  }

  return new NextResponse('\uFEFF' + rows.join('\n'), {
    headers: {
      'Content-Type': 'text/csv;charset=utf-8;',
      'Content-Disposition': `attachment; filename="user-events-${fromIso.slice(0,10)}_-_${toIso.slice(0,10)}.csv"`,
    },
  });
}
