// Mock next/server
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
  (MockNextResponse as any).json = (body: any, init?: { status?: number }) => ({
    status: init?.status || 200,
    json: () => Promise.resolve(body),
  });
  (MockNextResponse as any).next = () => ({ headers: new Map() });
  return { NextRequest: MockNextRequest, NextResponse: MockNextResponse };
});

const mockUser = { id: 'user-123', email: 'test@example.com' };

const mockGetServerClient = jest.fn(async () => ({
  from: jest.fn(() => ({
    select: jest.fn(() => Promise.resolve({ data: [], error: null })),
  })),
  rpc: jest.fn(() => Promise.resolve({
    data: [{ user_id: 'user-123', restaurant_count: 5, review_count: 10, visited_count: 3 }],
    error: null,
  })),
  auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })) },
}));

jest.mock('@/libs/supabase/server', () => ({
  getServerClient: (...args: any[]) => mockGetServerClient(...args),
}));

describe('Users Me Stats API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerClient.mockResolvedValue({
      from: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      rpc: jest.fn(() => Promise.resolve({
        data: [{ user_id: 'user-123', restaurant_count: 5, review_count: 10, visited_count: 3 }],
        error: null,
      })),
      auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })) },
    });
  });

  it('returns 401 when not authenticated', async () => {
    mockGetServerClient.mockResolvedValueOnce(null);
    const { GET } = await import('@/app/api/users/me/stats/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/users/me/stats');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns user stats on success', async () => {
    const { GET } = await import('@/app/api/users/me/stats/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/users/me/stats');
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it('returns zeros when no stats found', async () => {
    mockGetServerClient.mockResolvedValueOnce({
      from: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      rpc: jest.fn(() => Promise.resolve({ data: [], error: null })),
      auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })) },
    });
    const { GET } = await import('@/app/api/users/me/stats/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/users/me/stats');
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.restaurants).toBe(0);
    expect(data.reviews).toBe(0);
    expect(data.visited).toBe(0);
  });
});
