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
    public url: string;
    public nextUrl: URL;
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
  };
});

const mockUser = { id: 'user-123', email: 'test@example.com' };

jest.mock('@/libs/supabase/server', () => ({
  getServerClient: jest.fn(async () => ({
    from: jest.fn(() => {
      const chain: any = {};
      chain.select = jest.fn(() => chain);
      chain.eq = jest.fn(() => chain);
      chain.single = jest.fn(() => Promise.resolve({ data: { is_admin: true }, error: null }));
      chain.not = jest.fn(() => chain);
      chain.order = jest.fn(() => Promise.resolve({ data: [], error: null }));
      chain.limit = jest.fn(() => chain);
      chain.gte = jest.fn(() => chain);
      chain.lte = jest.fn(() => chain);
      // For count queries (head: true)
      const countResult = { count: 5, data: [], error: null };
      // Return count result for count queries, data for others
      const origSelect = chain.select;
      chain.select = jest.fn((...args: any[]) => {
        if (args[1] && args[1].head) {
          return { ...chain, data: [], ...countResult };
        }
        return origSelect(...args);
      });
      return chain;
    }),
    auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })) },
  })),
}));

describe('Admin Stats API', () => {
  let consoleErrorSpy: jest.SpyInstance;
  beforeEach(() => { consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); });
  afterEach(() => { consoleErrorSpy.mockRestore(); });

  describe('GET /api/admin/stats', () => {
    it('returns stats for admin user', async () => {
      const { GET } = await import('@/app/api/admin/stats/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost:3000/api/admin/stats');
      const res = await GET(req);
      expect(res.status).toBe(200);
    });

    it('returns 401 when user is not authenticated', async () => {
      const { getServerClient } = require('@/libs/supabase/server');
      (getServerClient as jest.Mock).mockResolvedValueOnce(null);
      const { GET } = await import('@/app/api/admin/stats/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost:3000/api/admin/stats');
      const res = await GET(req);
      expect(res.status).toBe(401);
    });

    it('returns 403 when user is not admin', async () => {
      const { getServerClient } = require('@/libs/supabase/server');
      (getServerClient as jest.Mock).mockResolvedValueOnce({
        from: jest.fn(() => {
          const chain: any = {};
          chain.select = jest.fn(() => chain);
          chain.eq = jest.fn(() => chain);
          chain.single = jest.fn(() => Promise.resolve({ data: { is_admin: false }, error: null }));
          return chain;
        }),
        auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })) },
      });
      const { GET } = await import('@/app/api/admin/stats/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost:3000/api/admin/stats');
      const res = await GET(req);
      expect(res.status).toBe(403);
    });
  });
});
