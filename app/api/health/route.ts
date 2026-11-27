import { NextRequest, NextResponse } from 'next/server';
import { privateNoStore, withCachePolicy } from '@/libs/http-cache';

export const dynamic = 'force-dynamic';

async function GETHandler(_request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '0.1.0',
  });
}

export const GET = withCachePolicy(privateNoStore, GETHandler);
