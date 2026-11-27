import { NextResponse } from 'next/server';
import { privateNoStore, withCachePolicy } from '@/libs/http-cache';

/**
 * Returns the VAPID public key for push notification subscription.
 * The private key should be stored in env vars and never exposed.
 */
async function GETHandler() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!publicKey) {
    return NextResponse.json({ error: 'Push notifications not configured' }, { status: 503 });
  }

  return NextResponse.json({ key: publicKey });
}

export const GET = withCachePolicy(privateNoStore, GETHandler);
