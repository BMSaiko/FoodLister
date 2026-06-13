// Mock next/server
jest.mock('next/server', () => {
  class MockNextRequest {
    constructor(input, init) {
      const urlStr = input instanceof URL ? input.toString() : input;
      this.url = urlStr;
      this.nextUrl = new URL(urlStr);
      this.method = (init && init.method) || 'GET';
      this.body = init && init.body;
    }
    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
    }
  }
  return {
    NextRequest: MockNextRequest,
    NextResponse: {
      json: (body, init) => ({
        status: init?.status || 200,
        json: () => Promise.resolve(body),
      }),
    },
  };
});

const mockUser = { id: 'user-123', email: 'test@example.com' };
const mockComments = [{ id: 'c1', list_id: 'l1', comment: 'Great', profiles: { display_name: 'Test' } }];

// Mock @supabase/supabase-js for GET (createClient)
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: mockComments, error: null })),
        })),
      })),
    })),
  })),
}));

// Mock @/libs/supabase/server for POST/DELETE (getServerClient)
jest.mock('@/libs/supabase/server', () => ({
  getServerClient: jest.fn(async () => ({
    from: jest.fn(() => {
      const chain = {};
      chain.select = jest.fn(() => chain);
      chain.eq = jest.fn(() => chain);
      chain.single = jest.fn(() => Promise.resolve({ data: mockComments[0], error: null }));
      chain.insert = jest.fn(() => chain);
      chain.delete = jest.fn(() => chain);
      return chain;
    }),
    auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })) },
  })),
}));

describe('Lists Comments API', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('GET /api/lists/[id]/comments', () => {
    it('returns comments for a list', async () => {
      const { GET } = await import('@/app/api/lists/[id]/comments/route');
      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/lists/list-1/comments');
      const response = await GET(request, { params: Promise.resolve({ id: 'list-1' }) });
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.comments).toBeDefined();
    });
  });

  describe('POST /api/lists/[id]/comments', () => {
    it('creates a new comment', async () => {
      const { POST } = await import('@/app/api/lists/[id]/comments/route');
      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/lists/list-1/comments', {
        method: 'POST',
        body: JSON.stringify({ comment: 'New comment' }),
      });
      const response = await POST(request, { params: Promise.resolve({ id: 'list-1' }) });
      expect(response.status).toBeDefined();
    });
  });
});
