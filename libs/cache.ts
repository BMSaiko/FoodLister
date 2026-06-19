/**
 * Simple in-memory cache with TTL support.
 * For production, consider Redis or Vercel KV.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<any>>();

/**
 * Get a cached value by key.
 * Returns undefined if not found or expired.
 */
export function cacheGet<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.value as T;
}

/**
 * Set a cache value with TTL in seconds.
 */
export function cacheSet<T>(key: string, value: T, ttlSeconds: number = 60): void {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Delete a cache entry.
 */
export function cacheDelete(key: string): void {
  cache.delete(key);
}

/**
 * Clear all cache entries.
 */
export function cacheClear(): void {
  cache.clear();
}

/**
 * Get or set a cached value using a factory function.
 * If the key exists and is not expired, returns cached value.
 * Otherwise, calls the factory, caches the result, and returns it.
 */
export async function cacheOrSet<T>(
  key: string,
  factory: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<T> {
  const cached = cacheGet<T>(key);
  if (cached !== undefined) return cached;

  const value = await factory();
  cacheSet(key, value, ttlSeconds);
  return value;
}

/**
 * Invalidate cache entries matching a prefix.
 */
export function cacheInvalidatePrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}
