// Mock next/server
jest.mock('next/server', () => {
  function MockNextResponse(this: any) {}
  (MockNextResponse as any).json = (body: any, init?: { status?: number }) => ({
    status: init?.status || 200,
    json: () => Promise.resolve(body),
  });
  (MockNextResponse as any).next = () => ({ headers: new Map() });
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
  return {
    NextRequest: MockNextRequest,
    NextResponse: MockNextResponse,
    },
  };
});

const mockUser = { id: 'user-123', email: 'test@example.com' };

jest.mock('@/libs/supabase/server', () => ({
  getServerClient: jest.fn(async () => ({
    from: jest.fn(() => {
      const chain: any = {};
      chain.select = jest.fn(() => chain);
      chain.eq = jest.fn(() => chain);
      chain.ilike = jest.fn(() => chain);
      chain.gte = jest.fn(() => chain);
      chain.lte = jest.fn(() => chain);
      chain.range = jest.fn(() => Promise.resolve({
        data: [
          {
            user_id: 'u1', user_id_code: 'FL000001', display_name: 'Test User',
            avatar_url: null, location: 'Lisbon', bio: null, public_profile: true,
            total_restaurants_visited: 5, total_reviews: 10, total_lists: 3,
            created_at: '2024-01-01',
          },
        ],
        error: null,
        count: 1,
      }));
      return chain;
    }),
    auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })) },
  })),
}));

describe('Users Search API', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('returns 401 when not authenticated', async () => {
    const { getServerClient } = await import('@/libs/supabase/server');
    (getServerClient as jest.Mock).mockResolvedValueOnce(null);
    const { GET } = await import('@/app/api/users/search/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/users/search?q=test');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns search results', async () => {
    const { GET } = await import('@/app/api/users/search/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/users/search?q=test');
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data).toBeDefined();
    expect(data.data.length).toBe(1);
    expect(data.data[0].name).toBe('Test User');
  });

  it('supports user_id_code search', async () => {
    const { GET } = await import('@/app/api/users/search/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/users/search?q=FL000001');
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data).toBeDefined();
  });

  it('supports pagination', async () => {
    const { GET } = await import('@/app/api/users/search/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/users/search?q=test&page=2&limit=10');
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.page).toBe(2);
    expect(data.limit).toBe(10);
  });
});
