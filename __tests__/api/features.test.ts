jest.mock('next/server', () => {
  const MockNextRequest = class {
    public method: string;
    public nextUrl: URL;
    public url: string;
    public headers: Map<string, string>;
    private _body: unknown;
    constructor(input: string | URL, init?: { method?: string; body?: unknown }) {
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
  };
  return {
    NextRequest: MockNextRequest,
    NextResponse: {
      json: (body: unknown, init?: { status?: number }) => ({
        status: init?.status ?? 200,
        json: () => Promise.resolve(body),
      }),
      next: () => ({ headers: new Map() }),
    },
  };
});

const mockUser = { id: 'user-123', email: 'test@example.com' };
const mockFeatures = [
  { id: 'f1', name: 'Outdoor Seating', description: 'Has outdoor area', icon: '🌳' },
  { id: 'f2', name: 'WiFi', description: 'Free WiFi', icon: '📶' },
];

const mockGetServerClient = jest.fn(async () => ({
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } })),
      })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: mockFeatures[0], error: null })),
      })),
    })),
  })),
  auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })) },
}));

const mockGetPublicServerClient = jest.fn(async () => ({
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      order: jest.fn(() => Promise.resolve({ data: mockFeatures, error: null })),
    })),
  })),
}));

jest.mock('@/libs/supabase/server', () => ({
  getServerClient: (...args: unknown[]) => mockGetServerClient(...args),
  getPublicServerClient: (...args: unknown[]) => mockGetPublicServerClient(...args),
}));

describe('Features API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerClient.mockResolvedValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } })),
          })),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockFeatures[0], error: null })),
          })),
        })),
      })),
      auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })) },
    });
    mockGetPublicServerClient.mockResolvedValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: mockFeatures, error: null })),
        })),
      })),
    });
  });

  describe('GET /api/features', () => {
    it('returns features', async () => {
      const { GET } = await import('@/app/api/features/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost/api/features');
      const res = await GET(req);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.data).toHaveLength(2);
      expect(data.total).toBe(2);
    });

    it('returns 500 when client fails', async () => {
      mockGetPublicServerClient.mockResolvedValueOnce(null);
      const { GET } = await import('@/app/api/features/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost/api/features');
      const res = await GET(req);
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/features', () => {
    it('returns 401 when not authenticated', async () => {
      mockGetServerClient.mockResolvedValueOnce({
        from: jest.fn(() => ({ select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn() })) })) })),
        auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })) },
      });
      const { POST } = await import('@/app/api/features/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost/api/features', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Feature' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it('returns 400 when name is missing', async () => {
      const { POST } = await import('@/app/api/features/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost/api/features', {
        method: 'POST',
        body: JSON.stringify({ description: 'No name' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('creates feature on success', async () => {
      const { POST } = await import('@/app/api/features/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost/api/features', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Feature', description: 'Test', icon: '⭐' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    });
  });
});
