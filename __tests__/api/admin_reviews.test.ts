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

jest.mock('@/libs/supabase/server', () => ({
  getServerClient: (...args: any[]) => mockGetServerClient(...args),
}));

jest.mock('@/libs/supabase/admin', () => ({
  createAdminClient: jest.fn(() => ({
    from: jest.fn(() => {
      const chain: any = {};
      chain.select = jest.fn(() => chain);
      chain.order = jest.fn(() => chain);
      chain.range = jest.fn(() => Promise.resolve({
        data: [{ id: 'rv1', restaurant_id: 'r1', user_id: 'u1', rating: 5, comment: 'Great!', user_name: 'Test' }],
        count: 1,
        error: null,
      }));
      return chain;
    }),
  })),
}));

describe('Admin Reviews API', () => {
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
    const { GET } = await import('@/app/api/admin/reviews/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/admin/reviews');
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
    const { GET } = await import('@/app/api/admin/reviews/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/admin/reviews');
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it('returns reviews list for admin', async () => {
    const { GET } = await import('@/app/api/admin/reviews/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/admin/reviews');
    const res = await GET(req);
    expect(res.status).toBe(200);
  });
});
