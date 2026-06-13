// Mock next/server
jest.mock('next/server', () => {
  class MockNextRequest {
    public method: string;
    public nextUrl: URL;
    public url: string;
    public headers: Map<string, string>;
    constructor(input: string | URL, init?: { method?: string; body?: any }) {
      const urlStr = input instanceof URL ? input.toString() : input;
      this.url = urlStr;
      this.nextUrl = new URL(urlStr);
      this.method = init?.method || 'GET';
      this.headers = new Map();
      this._body = init?.body;
    }
    async json() {
      if (typeof this._body === 'string') return JSON.parse(this._body);
      return this._body;
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

const mockUser = { id: 'user-123', email: 'test@example.com' };

const defaultMockSupabase = {
  from: jest.fn(() => {
    const chain: any = {};
    chain.select = jest.fn(() => chain);
    chain.eq = jest.fn(() => chain);
    chain.single = jest.fn(() => Promise.resolve({ data: { user_id: 'user-123', user_id_code: 'FL000001', display_name: 'Test', avatar_url: null, location: null, bio: null, website: null, phone_number: null, public_profile: true, total_restaurants_visited: 0, total_reviews: 0, total_lists: 0, created_at: '2024-01-01', updated_at: '2024-01-01' }, error: null }));
    chain.insert = jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: { user_id: 'user-123' }, error: null })) })) }));
    chain.update = jest.fn(() => ({ eq: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: { user_id: 'user-123' }, error: null })) })) })) }));
    return chain;
  }),
  auth: {
    getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
    updateUser: jest.fn(() => Promise.resolve({ error: null })),
  },
};

const mockGetServerClient = jest.fn(async () => defaultMockSupabase);

jest.mock('@/libs/supabase/server', () => ({
  getServerClient: (...args: any[]) => mockGetServerClient(...args),
}));

describe('Users Me API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerClient.mockResolvedValue(defaultMockSupabase);
    defaultMockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
  });

  describe('GET /api/users/me', () => {
    it('returns 401 when not authenticated', async () => {
      mockGetServerClient.mockResolvedValueOnce(null);
      const { GET } = await import('@/app/api/users/me/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost/api/users/me');
      const res = await GET(req);
      expect(res.status).toBe(401);
    });

    it('returns user profile on success', async () => {
      const { GET } = await import('@/app/api/users/me/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost/api/users/me');
      const res = await GET(req);
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /api/users/me', () => {
    it('returns 401 when not authenticated', async () => {
      mockGetServerClient.mockResolvedValueOnce(null);
      const { PUT } = await import('@/app/api/users/me/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost/api/users/me', {
        method: 'PUT',
        body: { display_name: 'New Name' },
      });
      const res = await PUT(req);
      expect(res.status).toBe(401);
    });

    it('returns 400 when display_name is empty', async () => {
      const { PUT } = await import('@/app/api/users/me/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost/api/users/me', {
        method: 'PUT',
        body: { display_name: '' },
      });
      const res = await PUT(req);
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid website URL', async () => {
      const { PUT } = await import('@/app/api/users/me/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost/api/users/me', {
        method: 'PUT',
        body: { display_name: 'Test', website: 'not-a-url' },
      });
      const res = await PUT(req);
      expect(res.status).toBe(400);
    });
  });
});
