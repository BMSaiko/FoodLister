// Mock next/server
jest.mock('next/server', () => {
  class MockNextRequest {
    public method: string;
    public nextUrl: URL;
    public url: string;
    public headers: Map<string, string>;
    constructor(input: string | URL, init?: { method?: string; body?: string }) {
      const urlStr = input instanceof URL ? input.toString() : input;
      this.url = urlStr;
      this.nextUrl = new URL(urlStr);
      this.method = init?.method || 'POST';
      this.headers = new Map();
      this._body = init?.body;
    }
    async json() {
      return typeof this._body === 'string' ? JSON.parse(this._body) : this._body;
    }
    private _body: any;
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

jest.mock('@/libs/supabase/server', () => ({
  getServerClient: jest.fn(async () => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          in: jest.fn(() => Promise.resolve({
            data: [
              { restaurant_id: 'r1', user_id: 'user-123' },
              { restaurant_id: 'r1', user_id: 'user-123' },
              { restaurant_id: 'r2', user_id: 'user-123' },
            ],
            error: null,
          })),
        })),
      })),
    })),
    auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })) },
  })),
}));

describe('Restaurants Visits API', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('returns 400 when restaurantIds is not an array', async () => {
    const { POST } = await import('@/app/api/restaurants/visits/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/restaurants/visits', {
      method: 'POST',
      body: JSON.stringify({ restaurantIds: 'not-an-array' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when restaurantIds is empty', async () => {
    const { POST } = await import('@/app/api/restaurants/visits/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/restaurants/visits', {
      method: 'POST',
      body: JSON.stringify({ restaurantIds: [] }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 401 when not authenticated', async () => {
    const { getServerClient } = await import('@/libs/supabase/server');
    (getServerClient as jest.Mock).mockResolvedValueOnce({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            in: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
      auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })) },
    });
    const { POST } = await import('@/app/api/restaurants/visits/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/restaurants/visits', {
      method: 'POST',
      body: JSON.stringify({ restaurantIds: ['r1'] }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns visit data on success', async () => {
    const { POST } = await import('@/app/api/restaurants/visits/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/restaurants/visits', {
      method: 'POST',
      body: JSON.stringify({ restaurantIds: ['r1', 'r2', 'r3'] }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.r1.visited).toBe(true);
    expect(data.r1.visit_count).toBe(2);
    expect(data.r2.visited).toBe(true);
    expect(data.r2.visit_count).toBe(1);
    expect(data.r3.visited).toBe(false);
    expect(data.r3.visit_count).toBe(0);
  });
});
