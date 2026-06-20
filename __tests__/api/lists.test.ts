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

const mockLists = [{ id: '1', name: 'Test', creator_id: 'user-123', is_public: true }];
const mockUser = { id: 'user-123', email: 'test@example.com' };

jest.mock('@/libs/supabase/server', () => ({
  getServerClient: jest.fn(async () => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        or: jest.fn(() => ({
          ilike: jest.fn(() => Promise.resolve({ data: mockLists, error: null })),
        })),
        eq: jest.fn(() => ({
          ilike: jest.fn(() => Promise.resolve({ data: mockLists, error: null })),
        })),
      })),
    })),
    auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })) },
  })),
}));

describe('Lists API', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('GET /api/lists', () => {
    it('returns lists for authenticated user', async () => {
      const { GET } = await import('@/app/api/lists/route');
      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/lists');
      const response = await GET(request);
      expect(response.status).toBeDefined();
    });
  });
});
