// libs/security.ts
// Security primitives for the HTTP edge layer: CORS whitelist + in-memory rate limiting.
// Used by middleware.ts (Edge runtime) — keep this module edge-safe: no Node-only APIs,
// no timers. ponytail: the limiter is per-instance/efémero on serverless functions (Vercel
// is stateless) — enough to stop scraping abuse; swap for Upstash Ratelimit (or a shared
// store) when the app goes multi-region / per-request scale matters.

// ---------------------------------------------------------------------------
// CORS whitelist
// ---------------------------------------------------------------------------
const DEFAULT_DEV_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
];

let cachedOrigins: string[] | null = null;

/** Resolve the allowed origins from env, falling back to localhost dev origins. */
export function getAllowedOrigins(): string[] {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const extra = (process.env.CORS_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const set = new Set<string>(DEFAULT_DEV_ORIGINS);
  if (appUrl) set.add(appUrl);
  for (const origin of extra) set.add(origin);
  cachedOrigins = [...set];
  return cachedOrigins;
}

/** True only for origins on the whitelist. `null` origin = same-origin, never cross-origin. */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return getAllowedOrigins().includes(origin);
}

export const CORS_ALLOW_METHODS = 'GET, POST, PUT, DELETE, OPTIONS';
export const CORS_ALLOW_HEADERS = 'Content-Type, Authorization';
export const CORS_MAX_AGE = '86400';

// ---------------------------------------------------------------------------
// Rate limiting (universal, in-memory, edge-safe)
// ---------------------------------------------------------------------------
interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 100_000;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSec?: number;
}

/**
 * Increment the counter for a key inside the sliding window. Returns whether the
 * request is allowed and, when not, the seconds to wait before retrying.
 */
export function checkRateLimitEdge(key: string, max: number, windowMs = 60_000): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    if (buckets.size >= MAX_BUCKETS) purgeExpiredBuckets(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  bucket.count += 1;
  if (bucket.count > max) {
    return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  return { allowed: true };
}

/** Drop expired buckets once the store grows; avoids an unbounded map on long-lived instances. */
export function purgeExpiredBuckets(now = Date.now()): void {
  for (const [key, b] of buckets) {
    if (now > b.resetAt) buckets.delete(key);
  }
}

/** Reset the store — for deterministic tests. */
export function resetRateLimitStore(): void {
  buckets.clear();
}

/** Best-effort client identity for rate limiting (X-Forwarded-For first hop). */
export function clientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return headers.get('x-real-ip') ?? 'unknown';
}

// ---------------------------------------------------------------------------
// Budgets
// ---------------------------------------------------------------------------
/** Public endpoints that hit third-party APIs or are enumerable — stricter budget. */
export const SENSITIVE_API_PREFIXES = [
  '/api/osm/geocode',
  '/api/resolve-google-maps-url',
  '/api/users/search',
  '/api/notifications/email',
];

export const DEFAULT_API_LIMIT = 120;
export const SENSITIVE_API_LIMIT = 30;
export const RATE_LIMIT_WINDOW_MS = 60_000;

function envPositiveInt(name: string, fallback: number): number {
  const v = Number(process.env[name] ?? '');
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : fallback;
}

/** Per-path rate budget, tunable via env. */
export function rateLimitBudget(pathname: string): { max: number; windowMs: number } {
  const sensitive = SENSITIVE_API_PREFIXES.some((p) => pathname.startsWith(p));
  if (sensitive) {
    return {
      max: envPositiveInt('RATE_LIMIT_SENSITIVE_MAX', SENSITIVE_API_LIMIT),
      windowMs: RATE_LIMIT_WINDOW_MS,
    };
  }
  return {
    max: envPositiveInt('RATE_LIMIT_MAX', DEFAULT_API_LIMIT),
    windowMs: RATE_LIMIT_WINDOW_MS,
  };
}
