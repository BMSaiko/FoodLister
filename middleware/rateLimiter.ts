/**
 * Simple in-memory rate limiter for API routes
 * Stores request counts in a Map with TTL-based expiration
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

const defaultOptions: RateLimitOptions = {
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
};

export function rateLimiter(options?: Partial<RateLimitOptions>) {
  const { maxRequests, windowMs } = { ...defaultOptions, ...options };

  return async function (identifier: string): Promise<{ success: boolean; remaining: number; resetAt: number }> {
    const now = Date.now();
    const key = `ratelimit:${identifier}`;
    
    const entry = rateLimitMap.get(key);
    
    if (!entry || now > entry.resetAt) {
      // Create new entry
      rateLimitMap.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return { success: true, remaining: maxRequests - 1, resetAt: now + windowMs };
    }
    
    if (entry.count >= maxRequests) {
      return { success: false, remaining: 0, resetAt: entry.resetAt };
    }
    
    entry.count++;
    return { success: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 60 * 1000); // Clean up every minute

export const apiRateLimiter = rateLimiter({ maxRequests: 100, windowMs: 15 * 60 * 1000 });
export const authRateLimiter = rateLimiter({ maxRequests: 10, windowMs: 15 * 60 * 1000 });