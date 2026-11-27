import { NextRequest, NextResponse } from 'next/server';
import { getPublicServerClient } from '@/libs/supabase/server';
import { cacheOrSet } from '@/libs/cache';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';
import { DEFAULT_LIMIT, MAX_LIMIT, listReleases } from '@/libs/releases/server';
import { privateNoStore, withCachePolicy } from '@/libs/http-cache';

export const dynamic = 'force-dynamic';

/** Teto de páginas: evita chaves de cache ilimitadas por pedidos públicos. */
const MAX_PAGE = 1000;

const fail = (type: ApiErrorType, status: number) =>
  NextResponse.json({ error: getErrorMessage(type), code: type }, { status });

/** Inteiro >= 1 a partir de um parâmetro opcional; `null` se inválido. */
function positiveInt(raw: string | null, fallback: number): number | null {
  if (raw === null) return fallback;
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return n >= 1 ? n : null;
}

async function GETHandler(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const page = positiveInt(params.get('page'), 1);
    const requested = positiveInt(params.get('limit'), DEFAULT_LIMIT);
    if (page === null || page > MAX_PAGE || requested === null) return fail('VALIDATION_ERROR', 400);
    const limit = Math.min(requested, MAX_LIMIT);

    const supabase = await getPublicServerClient();
    if (!supabase) return fail('DATABASE_ERROR', 500);

    const data = await cacheOrSet(`releases:${page}:${limit}`, () => listReleases(supabase, page, limit), 300);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Server error fetching releases:', error);
    return fail('INTERNAL_ERROR', 500);
  }
}

export const GET = withCachePolicy(privateNoStore, GETHandler);
