jest.mock('next/server', () => {
  const MockNextRequest = class {
    public method: string;
    public nextUrl: URL;
    public url: string;
    public headers: Map<string, string>;
    constructor(input: string | URL) {
      const urlStr = input instanceof URL ? input.toString() : input;
      this.url = urlStr;
      this.nextUrl = new URL(urlStr);
      this.method = 'GET';
      this.headers = new Map();
    }
  };
  class MockNextResponse {
    public headers: Map<string, string>;
    constructor() {
      this.headers = new Map();
    }
    static json(body: unknown, init?: { status?: number }) {
      return {
        status: init?.status ?? 200,
        json: () => Promise.resolve(body),
      };
    }
    static next() {
      return { headers: new Map() };
    }
  }
  return {
    NextRequest: MockNextRequest,
    NextResponse: MockNextResponse,
  };
});

const mockUser = { id: 'user-123', email: 'test@example.com' };

jest.mock('@/libs/supabase/server', () => ({
  getServerClient: jest.fn(async () => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          ilike: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                range: jest.fn(() => Promise.resolve({
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
                })),
              })),
            })),
          })),
        })),
      })),
    })),
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
