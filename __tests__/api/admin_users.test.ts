// Mock next/server
jest.mock('next/server', () => {
  class MockNextRequest {
    public method: string;
    public nextUrl: URL;
    public url: string;
    constructor(input: string | URL) {
      const urlStr = input instanceof URL ? input.toString() : input;
      this.url = urlStr;
      this.nextUrl = new URL(urlStr);
      this.method = 'GET';
    }
  }
  function MockNextResponse(this: any) {}
  (MockNextResponse as any).json = (body: any, init?: { status?: number }) => ({
    status: init?.status || 200,
    json: () => Promise.resolve(body),
  });
  (MockNextResponse as any).next = () => ({ headers: new Map() });
  return { NextRequest: MockNextRequest, NextResponse: MockNextResponse };
});

const mockUser = { id: 'user-123', email: 'test@example.com' };

const mockGetServerClient = jest.fn(async () => ({
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: { is_admin: true }, error: null })),
      })),
    })),
  })),
  auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })) },
}));

const mockAdminClient = {
  from: jest.fn(() => {
    const chain: any = {};
    chain.select = jest.fn(() => chain);
    chain.order = jest.fn(() => chain);
    chain.range = jest.fn(() => chain);
    chain.ilike = jest.fn(() => chain);
    chain.in = jest.fn(() => chain);
    chain.eq = jest.fn(() => chain);
    chain.neq = jest.fn(() => chain);
    chain.maybeSingle = jest.fn(() => Promise.resolve({ data: null, error: null }));
    chain.single = jest.fn(() => Promise.resolve({ data: null, error: null }));
    // Final execution
    const execResult = {
      data: [
        { id: 'u1', user_id: 'user-123', display_name: 'Admin User', is_admin: true },
        { id: 'u2', user_id: 'user-456', display_name: 'Regular User', is_admin: false },
      ],
      count: 2,
      error: null,
    };
    // When called without further chaining, return execResult
    chain.then = undefined;
    // Make the chain thenable
    Object.defineProperty(chain, 'then', {
      get() { return (cb: any) => Promise.resolve(execResult).then(cb); },
    });
    return chain;
  }),
};

jest.mock('@/libs/supabase/server', () => ({
  getServerClient: (...args: any[]) => mockGetServerClient(...args),
}));

jest.mock('@/libs/supabase/admin', () => ({
  createAdminClient: jest.fn(() => mockAdminClient),
}));

describe('Admin Users API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerClient.mockResolvedValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: { is_admin: true }, error: null })),
          })),
        })),
      })),
      auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })) },
    });
  });

  it('returns 401 when not authenticated', async () => {
    mockGetServerClient.mockResolvedValueOnce(null);
    const { GET } = await import('@/app/api/admin/users/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/admin/users');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 403 when user is not admin', async () => {
    mockGetServerClient.mockResolvedValueOnce({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: { is_admin: false }, error: null })),
          })),
        })),
      })),
      auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })) },
    });
    const { GET } = await import('@/app/api/admin/users/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/admin/users');
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it('returns users list for admin', async () => {
    const { GET } = await import('@/app/api/admin/users/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/admin/users');
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it('supports pagination', async () => {
    const { GET } = await import('@/app/api/admin/users/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/admin/users?page=2&limit=10');
    const res = await GET(req);
    expect(res.status).toBe(200);
  });
});
