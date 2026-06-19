// Mock next/server BEFORE any imports
jest.mock('next/server', () => {
  class MockNextRequest {
    public method: string;
    public nextUrl: URL;
    public url: string;
    constructor(input: string | URL) {
      const urlStr = input instanceof URL ? input.toString() : input;
      this.url = urlStr;
      this.nextUrl = new URL(urlStr);
      this.method = 'GET';
    }
  }
  function MockNextResponse(this: any) {}
  (MockNextResponse as any).json = (body: any, init?: { status?: number }) => ({ status: init?.status || 200, json: () => Promise.resolve(body) });
  return { NextRequest: MockNextRequest, NextResponse: MockNextResponse };
});

const mockUser = { id: 'user-123', email: 'test@example.com' };

jest.mock('@/libs/supabase/server', () => ({
  getServerClient: jest.fn(async () => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      delete: jest.fn(() => ({ eq: jest.fn(() => Promise.resolve({ error: null })) })),
    })),
    auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })) },
  })),
}));

describe('Lists Collaborators API', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('GET', () => {
    it('returns 200 on success', async () => {
      const { GET } = await import('@/app/api/lists/[id]/collaborators/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost/api/lists/list-1/collaborators');
      const res = await GET(req, { params: Promise.resolve({ id: 'list-1' }) });
      expect(res.status).toBe(200);
    });
  });

  describe('GET with auth', () => {
    it('returns 401 when not authenticated', async () => {
      const { getServerClient } = await import('@/libs/supabase/server');
      (getServerClient as any).mockResolvedValueOnce(null);
      const { GET } = await import('@/app/api/lists/[id]/collaborators/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost/api/lists/list-1/collaborators');
      const res = await GET(req, { params: Promise.resolve({ id: 'list-1' }) });
      expect(res.status).toBe(401);
    });
  });
});
