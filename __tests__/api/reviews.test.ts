// Mock next/server BEFORE any imports
jest.mock('next/server', () => {
  class MockNextRequest {
    public method: string;
    public headers: Map<string, string>;
    public nextUrl: URL;
    public url: string;
    constructor(input: string | URL, _init?: RequestInit) {
      const urlStr = input instanceof URL ? input.toString() : input;
      this.url = urlStr;
      this.nextUrl = new URL(urlStr);
      this.method = 'GET';
      this.headers = new Map();
    }
  }
  return {
    NextRequest: MockNextRequest,
    NextResponse: {
      next: () => ({ headers: new Map(), headers: { set: jest.fn() } }),
      json: (body: any, init?: { status?: number; headers?: Record<string, string> }) => ({
        status: init?.status || 200,
        json: () => Promise.resolve(body),
        headers: { set: jest.fn() },
      }),
    },
  };
});

jest.mock('@/libs/supabase/client', () => ({
  getClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({ eq: jest.fn(() => Promise.resolve({ data: [{ rating: 4 }], error: null })) })),
      update: jest.fn(() => ({ eq: jest.fn(() => Promise.resolve({ error: null })) })),
    })),
  })),
}));

const mockUser = { id: 'user-123', email: 'test@example.com' };

jest.mock('@/libs/supabase/server', () => ({
  getServerClient: jest.fn(async () => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
            single: jest.fn(() => Promise.resolve({ data: { display_name: 'Test' }, error: null })),
          })),
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        in: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: { id: 'rev-1', rating: 5 }, error: null })) })),
      })),
    })),
    auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })) },
  })),
  getPublicServerClient: jest.fn(async () => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({ order: jest.fn(() => Promise.resolve({ data: [], error: null })) })),
        in: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  })),
}));

describe('Reviews API', () => {
  let consoleErrorSpy: jest.SpyInstance;
  beforeEach(() => { jest.clearAllMocks(); consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); });
  afterEach(() => { consoleErrorSpy.mockRestore(); });

  describe('GET /api/reviews', () => {
    it('returns 400 when restaurant_id is missing', async () => {
      const { GET } = await import('@/app/api/reviews/route');
      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/reviews');
      const response = await GET(request);
      expect(response.status).toBe(400);
    });

    it('returns reviews for a valid restaurant_id', async () => {
      const { GET } = await import('@/app/api/reviews/route');
      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/reviews?restaurant_id=rest-1');
      const response = await GET(request);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.reviews).toBeDefined();
    });
  });

  describe('POST /api/reviews', () => {
    it('returns 400 when restaurant_id is missing', async () => {
      const { POST } = await import('@/app/api/reviews/route');
      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/reviews');
      (request as any).json = jest.fn(() => Promise.resolve({ rating: 5 }));
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('returns 400 when rating is out of range', async () => {
      const { POST } = await import('@/app/api/reviews/route');
      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/reviews');
      (request as any).json = jest.fn(() => Promise.resolve({ restaurant_id: 'rest-1', rating: 6 }));
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('returns 401 when user is not authenticated', async () => {
      const { getServerClient } = await import('@/libs/supabase/server');
      (getServerClient as jest.Mock).mockResolvedValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({ eq: jest.fn(() => ({ maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })) })) })),
          insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: null, error: null })) })) })),
        })),
        auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })) },
      });
      const { POST } = await import('@/app/api/reviews/route');
      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/reviews');
      (request as any).json = jest.fn(() => Promise.resolve({ restaurant_id: 'rest-1', rating: 4 }));
      const response = await POST(request);
      expect(response.status).toBe(401);
    });
  });
});
