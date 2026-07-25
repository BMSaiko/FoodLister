/**
 * Server-side in-memory TTL cache.
 * Scoped per serverless function instance — use cacheInvalidatePrefix
 * for write-time invalidation. For persistent shared cache across instances,
 * swap the Map for a Redis/Vercel KV backend.
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

/**
 * Check if a cache entry exists and is not expired.
 */
export function cacheHas(key: string): boolean {
  return cacheGet(key) !== undefined;
}

/**
 * Return all cache keys, optionally filtered by prefix.
 */
export function cacheKeys(prefix?: string): string[] {
  if (!prefix) return Array.from(cache.keys());
  return Array.from(cache.keys()).filter((k) => k.startsWith(prefix));
}
