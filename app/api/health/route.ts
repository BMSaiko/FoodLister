import { NextRequest, NextResponse } from 'next/server';
import { privateNoStore, withCachePolicy } from '@/libs/http-cache';
import { getPublicServerClient } from '@/libs/supabase/server';

export const dynamic = 'force-dynamic';

const DB_PROBES = 3;

// RTT função → Supabase: mediana de DB_PROBES queries triviais (HEAD sem linhas).
// Só com `?db=1`, para o health normal não tocar na BD.
async function measureDbRtt(): Promise<{ rttMs: number | null; samplesMs: number[]; error?: string }> {
  const client = await getPublicServerClient();
  if (!client) return { rttMs: null, samplesMs: [], error: 'supabase_not_configured' };

  const samplesMs: number[] = [];
  for (let i = 0; i < DB_PROBES; i++) {
    const start = performance.now();
    const { error } = await client.from('restaurants').select('id', { head: true, count: 'estimated' }).limit(1);
    samplesMs.push(Math.round((performance.now() - start) * 10) / 10);
    if (error) return { rttMs: null, samplesMs, error: 'query_failed' };
  }
  const sorted = [...samplesMs].sort((a, b) => a - b);
  return { rttMs: sorted[Math.floor(sorted.length / 2)], samplesMs };
}

async function GETHandler(request: NextRequest) {
  const body: Record<string, unknown> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '0.1.0',
    region: process.env.VERCEL_REGION ?? null,
  };

  if (request.nextUrl.searchParams.get('db') === '1') {
    body.db = await measureDbRtt();
  }

  return NextResponse.json(body);
}

export const GET = withCachePolicy(privateNoStore, GETHandler);
