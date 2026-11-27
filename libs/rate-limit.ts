// Simple in-memory rate limiter por instância (serverless: limite best-effort, sem KV)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Limpeza lazy (sem setInterval ao nível do módulo): purga expirados ao crescer
const MAX_ENTRIES = 1000;
function purgeExpired(now: number) {
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 60,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  if (rateLimitMap.size > MAX_ENTRIES) purgeExpired(now);
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: maxRequests - entry.count };
}
