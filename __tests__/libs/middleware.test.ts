/** @jest-environment node */
import { NextRequest } from 'next/server';

const getUser = jest.fn();
const maybeSingle = jest.fn();
const createServerClient = jest.fn(() => ({
  auth: { getUser },
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }),
}));

jest.mock('@supabase/ssr', () => ({ createServerClient: (...a: unknown[]) => (createServerClient as any)(...a) }));

import { middleware, config } from '../../middleware';

const req = (path: string, method = 'GET') => new NextRequest(`http://localhost${path}`, { method });

beforeEach(() => {
  jest.clearAllMocks();
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://sb';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
});

describe('middleware', () => {
  it('matcher só cobre /admin e /api', () => {
    expect(config.matcher).toEqual(['/admin/:path*', '/api/:path*']);
  });

  it('admin sem sessão → redirect para signin', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await middleware(req('/admin/users'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/auth/signin');
  });

  it('não-admin → /unauthorized', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    maybeSingle.mockResolvedValue({ data: { is_admin: false }, error: null });
    const res = await middleware(req('/admin'));
    expect(res.headers.get('location')).toContain('/unauthorized');
  });

  it('admin passa', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    maybeSingle.mockResolvedValue({ data: { is_admin: true }, error: null });
    const res = await middleware(req('/admin'));
    expect(res.status).toBe(200);
  });

  it('/api não toca no Supabase e põe CORS', async () => {
    const res = await middleware(req('/api/restaurants'));
    expect(createServerClient).not.toHaveBeenCalled();
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
  });

  it('preflight OPTIONS em /api → 204', async () => {
    const res = await middleware(req('/api/restaurants', 'OPTIONS'));
    expect(res.status).toBe(204);
  });
});
