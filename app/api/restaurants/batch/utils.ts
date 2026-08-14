// app/api/restaurants/batch/utils.ts
import type { NextRequest } from 'next/server';

export function normName(name: string): string {
  return (name || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function extractPlaceId(sourceUrl?: string): string | null {
  if (!sourceUrl) return null;
  const m = sourceUrl.match(/!1s([^!]+)/);
  return m ? m[1] : null;
}

export function isDuplicate(
  restaurant: { name?: string; source_url?: string },
  existing: Array<{ source_url?: string | null; name?: string | null }>
): boolean {
  if (restaurant.source_url && existing.some((e) => e.source_url === restaurant.source_url)) return true;
  const pid = extractPlaceId(restaurant.source_url);
  if (pid && existing.some((e) => extractPlaceId(e.source_url ?? undefined) === pid)) return true;
  const nm = normName(restaurant.name ?? '');
  if (nm && existing.some((e) => nm === normName(e.name ?? ''))) return true;
  return false;
}
