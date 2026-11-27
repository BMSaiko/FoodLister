jest.mock('next/server', () => ({
  NextRequest: class {},
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: () => Promise.resolve(body),
    }),
  },
}));
jest.mock('next/headers', () => ({}));

const auth = {
  getSession: jest.fn(),
  getClaims: jest.fn(),
  getUser: jest.fn(),
};
const profileSingle = jest.fn();
const fakeClient = {
  auth,
  from: () => ({ select: () => ({ eq: () => ({ single: profileSingle }) }) }),
};
jest.mock('@supabase/ssr', () => ({ createServerClient: () => fakeClient }));

import { getAuthUser, requireUser, requireAdmin } from '@/libs/supabase/server';

const req: any = { cookies: { getAll: () => [], set: jest.fn() } };
const res: any = { cookies: { set: jest.fn() } };
const claims = {
  sub: 'u1',
  email: 'a@b.pt',
  aud: 'authenticated',
  role: 'authenticated',
  user_metadata: { name: 'A' },
  app_metadata: { provider: 'email' },
};

beforeEach(() => {
  jest.clearAllMocks();
  auth.getSession.mockResolvedValue({ data: { session: { expires_at: 9999999999 } }, error: null });
});

describe('getAuthUser', () => {
  it('usa getClaims e nunca getUser', async () => {
    auth.getClaims.mockResolvedValue({ data: { claims }, error: null });
    const user = await getAuthUser(fakeClient as any);
    expect(user).toMatchObject({ id: 'u1', email: 'a@b.pt', user_metadata: { name: 'A' } });
    expect(auth.getUser).not.toHaveBeenCalled();
  });
  it('devolve null com erro nos claims', async () => {
    auth.getClaims.mockResolvedValue({ data: null, error: new Error('jwt expired') });
    expect(await getAuthUser(fakeClient as any)).toBeNull();
  });
  it('devolve null sem claims ou sem sub', async () => {
    auth.getClaims.mockResolvedValue({ data: { claims: { ...claims, sub: undefined } }, error: null });
    expect(await getAuthUser(fakeClient as any)).toBeNull();
    auth.getClaims.mockResolvedValue({ data: null, error: null });
    expect(await getAuthUser(fakeClient as any)).toBeNull();
  });
  it('devolve null se getClaims lançar', async () => {
    auth.getClaims.mockRejectedValue(new Error('boom'));
    expect(await getAuthUser(fakeClient as any)).toBeNull();
  });
});

describe('requireUser', () => {
  it('401 sem sessão', async () => {
    auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    const r: any = await requireUser(req, res);
    expect(r.ok).toBe(false);
    expect(r.response.status).toBe(401);
    expect(auth.getClaims).not.toHaveBeenCalled();
  });
  it('401 com claims inválidos', async () => {
    auth.getClaims.mockResolvedValue({ data: null, error: new Error('bad') });
    const r: any = await requireUser(req, res);
    expect(r.ok).toBe(false);
    expect(r.response.status).toBe(401);
  });
  it('ok com um só pedido de validação (sem getUser)', async () => {
    auth.getClaims.mockResolvedValue({ data: { claims }, error: null });
    const r: any = await requireUser(req, res);
    expect(r.ok).toBe(true);
    expect(r.user.id).toBe('u1');
    expect(auth.getClaims).toHaveBeenCalledTimes(1);
    expect(auth.getUser).not.toHaveBeenCalled();
  });
});

describe('requireAdmin', () => {
  it('403 se não for admin', async () => {
    auth.getClaims.mockResolvedValue({ data: { claims }, error: null });
    profileSingle.mockResolvedValue({ data: { is_admin: false } });
    const r: any = await requireAdmin(req, res);
    expect(r.ok).toBe(false);
    expect(r.response.status).toBe(403);
  });
  it('ok se for admin', async () => {
    auth.getClaims.mockResolvedValue({ data: { claims }, error: null });
    profileSingle.mockResolvedValue({ data: { is_admin: true } });
    const r: any = await requireAdmin(req, res);
    expect(r.ok).toBe(true);
  });
});
