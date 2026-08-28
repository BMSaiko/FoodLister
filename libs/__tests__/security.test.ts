import {
  checkRateLimitEdge,
  resetRateLimitStore,
  isOriginAllowed,
  getAllowedOrigins,
  rateLimitBudget,
  SENSITIVE_API_PREFIXES,
} from '@/libs/security';

describe('libs/security — CORS whitelist', () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.CORS_ALLOWED_ORIGINS;
  });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it('allows the configured app URL and localhost dev origins', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://foodlister.app';
    const allowed = getAllowedOrigins();
    expect(allowed).toContain('https://foodlister.app');
    expect(allowed).toContain('http://localhost:3000');
  });

  it('parses extra origins from CORS_ALLOWED_ORIGINS', () => {
    process.env.CORS_ALLOWED_ORIGINS = ' https://m.app , https://hq.app ';
    const allowed = getAllowedOrigins();
    expect(allowed).toContain('https://m.app');
    expect(allowed).toContain('https://hq.app');
  });

  it('rejects unknown origins and null (same-origin)', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://foodlister.app';
    expect(isOriginAllowed('https://foodlister.app')).toBe(true);
    expect(isOriginAllowed('https://evil.example')).toBe(false);
    expect(isOriginAllowed(null)).toBe(false);
  });
});

describe('libs/security — universal rate limiter', () => {
  beforeEach(() => resetRateLimitStore());

  it('allows up to max requests per window, then 429 with retry', () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimitEdge('ip:1', 5).allowed).toBe(true);
    }
    const denied = checkRateLimitEdge('ip:1', 5);
    expect(denied.allowed).toBe(false);
    expect(typeof denied.retryAfterSec).toBe('number');
    // Different key is unaffected.
    expect(checkRateLimitEdge('ip:2', 5).allowed).toBe(true);
  });

  it('resets the window after the window elapses', () => {
    for (let i = 0; i < 3; i++) checkRateLimitEdge('ip:9', 3);
    expect(checkRateLimitEdge('ip:9', 3).allowed).toBe(false);
    resetRateLimitStore();
    expect(checkRateLimitEdge('ip:9', 3).allowed).toBe(true);
  });
});

describe('libs/security — budgets', () => {
  it('gives sensitive endpoints a stricter limit', () => {
    const normal = rateLimitBudget('/api/restaurants');
    for (const prefix of SENSITIVE_API_PREFIXES) {
      const s = rateLimitBudget(prefix);
      expect(s.max).toBeLessThan(normal.max);
    }
  });
});
