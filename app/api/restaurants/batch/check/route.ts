// app/api/restaurants/batch/check/route.ts
// ponytail: mark duplicates during the EXTRACTION phase (BMS sees "Pronto" pre-import).
// Reuses isDuplicate from the batch route; returns which of the submitted source_urls
// already exist in restaurants (by source_url / place_id / name+coords / address+coords).
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/libs/supabase/server';
import { isDuplicate } from '../route';

interface CheckItem {
  name?: string;
  source_url?: string;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request, new NextResponse());
    if (!auth.ok) return auth.response;
    const supabase = auth.supabase;

    const body = (await request.json().catch(() => ({}))) as { restaurants?: CheckItem[] };
    const items: CheckItem[] = Array.isArray(body.restaurants) ? body.restaurants : [];

    const { data: existingRows } = await supabase
      .from('restaurants')
      .select('id, source_url, name');
    const existing = existingRows || [];

    const dup = new Set<number>();
    items.forEach((r, i) => {
      if (isDuplicate(r, existing)) dup.add(i);
    });

    return NextResponse.json({ duplicateIndexes: [...dup] });
  } catch {
    const errorType = 'INTERNAL_ERROR' as const;
    return NextResponse.json({ error: 'Erro interno', code: errorType }, { status: 500 });
  }
}
