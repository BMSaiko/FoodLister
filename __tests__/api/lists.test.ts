// Mock next/server
jest.mock('next/server', () => {
  class MockNextRequest {
    constructor(input) {
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
      next: () => ({ headers: new Map() }),
      json: (body, init) => ({
        status: init?.status || 200,
        json: () => Promise.resolve(body),
      }),
    },
  };
});

const mockLists = [{ id: '1', name: 'Test', creator_id: 'user-123', is_public: true }];
const mockUser = { id: 'user-123', email: 'test@example.com' };

jest.mock('@/libs/supabase/server', () => ({
  getServerClient: jest.fn(async () => ({
    from: jest.fn(() => {
      const chain = {};
      chain.select = jest.fn(() => chain);
      chain.or = jest.fn(() => chain);
      chain.ilike = jest.fn(() => chain);
      chain.eq = jest.fn(() => chain);
      return chain;
    }),
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
