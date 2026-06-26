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
  return {
    NextRequest: MockNextRequest,
    NextResponse: MockNextResponse,
  };
});

const mockUser = { id: 'user-123', email: 'test@example.com', user_metadata: {}, created_at: '2024-01-01' };

jest.mock('@/libs/supabase/server', () => ({
  getServerClient: jest.fn(async () => ({
    from: jest.fn(() => {
      const chain: any = {};
      chain.select = jest.fn(() => chain);
      chain.eq = jest.fn(() => chain);
      chain.single = jest.fn(() => Promise.resolve({
        data: {
          id: 'p1', user_id: 'user-123', user_id_code: 'FL000001',
          display_name: 'Test', bio: null, avatar_url: null, website: null,
          location: null, phone_number: null, public_profile: true,
          total_reviews: 0, total_lists: 0,
          created_at: '2024-01-01', updated_at: '2024-01-01',
        },
        error: null,
      }));
      chain.insert = jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { id: 'p1' }, error: null })),
        })),
      }));
      chain.update = jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: { id: 'p1' }, error: null })),
          })),
        })),
      }));
      return chain;
    }),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
      updateUser: jest.fn(() => Promise.resolve({ error: null })),
    },
  })),
}));

describe('Users Settings API', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('GET /api/users/settings', () => {
    it('returns 401 when not authenticated', async () => {
      const { getServerClient } = await import('@/libs/supabase/server');
      (getServerClient as jest.Mock).mockResolvedValueOnce(null);
      const { GET } = await import('@/app/api/users/settings/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost/api/users/settings');
      const res = await GET(req);
      expect(res.status).toBe(401);
    });

    it('returns profile data on success', async () => {
      const { GET } = await import('@/app/api/users/settings/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost/api/users/settings');
      const res = await GET(req);
      expect(res.status).toBe(200);
    });

    it('returns default structure when no profile exists', async () => {
      const { getServerClient } = await import('@/libs/supabase/server');
      (getServerClient as jest.Mock).mockResolvedValueOnce({
        from: jest.fn(() => {
          const chain: any = {};
          chain.select = jest.fn(() => chain);
          chain.eq = jest.fn(() => chain);
          chain.single = jest.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } }));
          return chain;
        }),
        auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })) },
      });
      const { GET } = await import('@/app/api/users/settings/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost/api/users/settings');
      const res = await GET(req);
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /api/users/settings', () => {
    it('returns 401 when not authenticated', async () => {
      const { getServerClient } = await import('@/libs/supabase/server');
      (getServerClient as jest.Mock).mockResolvedValueOnce(null);
      const { PUT } = await import('@/app/api/users/settings/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost/api/users/settings', {
        method: 'PUT',
        body: JSON.stringify({ display_name: 'New Name' }),
      });
      const res = await PUT(req);
      expect(res.status).toBe(401);
    });

    it('returns 400 when display_name is empty', async () => {
      const { PUT } = await import('@/app/api/users/settings/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost/api/users/settings', {
        method: 'PUT',
        body: JSON.stringify({ display_name: '' }),
      });
      const res = await PUT(req);
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid website URL', async () => {
      const { PUT } = await import('@/app/api/users/settings/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost/api/users/settings', {
        method: 'PUT',
        body: JSON.stringify({ display_name: 'Test', website: 'not-a-url' }),
      });
      const res = await PUT(req);
      expect(res.status).toBe(400);
    });
  });
});
