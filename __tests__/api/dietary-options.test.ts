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
      this.method = init?.method || 'GET';
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

const mockDietaryOptions = [
  { id: 'd1', name: 'Vegan', description: 'No animal products', icon: '🌱' },
  { id: 'd2', name: 'Gluten-Free', description: 'No gluten', icon: '🌾' },
];

jest.mock('@/libs/supabase/server', () => ({
  getPublicServerClient: jest.fn(async () => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: mockDietaryOptions, error: null })),
      })),
    })),
  })),
  getServerClient: jest.fn(async () => ({
    from: jest.fn(() => {
      const chain: any = {};
      chain.select = jest.fn(() => chain);
      chain.eq = jest.fn(() => chain);
      chain.single = jest.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } }));
      chain.insert = jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: mockDietaryOptions[0], error: null })),
        })),
      }));
      return chain;
    }),
    auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'user-123' } }, error: null })) },
  })),
}));

describe('Dietary Options API', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('GET /api/dietary-options', () => {
    it('returns dietary options', async () => {
      const { GET } = await import('@/app/api/dietary-options/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost/api/dietary-options');
      const res = await GET(req);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.data).toHaveLength(2);
      expect(data.total).toBe(2);
    });

    it('returns 500 when client fails', async () => {
      const { getPublicServerClient } = require('@/libs/supabase/server');
      (getPublicServerClient as jest.Mock).mockResolvedValueOnce(null);
      const { GET } = await import('@/app/api/dietary-options/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost/api/dietary-options');
      const res = await GET(req);
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/dietary-options', () => {
    it('returns 401 when not authenticated', async () => {
      const { getServerClient } = require('@/libs/supabase/server');
      (getServerClient as jest.Mock).mockResolvedValueOnce({
        from: jest.fn(() => ({ select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn() })) })) })),
        auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })) },
      });
      const { POST } = await import('@/app/api/dietary-options/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost/api/dietary-options', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Option' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it('returns 400 when name is missing', async () => {
      const { POST } = await import('@/app/api/dietary-options/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost/api/dietary-options', {
        method: 'POST',
        body: JSON.stringify({ description: 'No name' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('creates dietary option on success', async () => {
      const { POST } = await import('@/app/api/dietary-options/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost/api/dietary-options', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Option', description: 'Test', icon: '🔥' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    });
  });
});
