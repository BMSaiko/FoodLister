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
    public nextUrl: URL;
    public url: string;
    constructor(input: string | URL) {
      const urlStr = input instanceof URL ? input.toString() : input;
      this.url = urlStr;
      this.nextUrl = new URL(urlStr);
      this.method = 'GET';
    }
  }
  return { NextRequest: MockNextRequest, NextResponse: MockNextResponse };
});

const mockUser = {
  id: 'user-123', email: 'test@example.com', phone: null,
  app_metadata: {}, user_metadata: {}, created_at: '2024-01-01', updated_at: '2024-01-01',
};

const mockSupabase = {
  auth: {
    getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
    getSession: jest.fn(() => Promise.resolve({
      data: {
        session: {
          access_token: 'test-token',
          refresh_token: 'test-refresh',
          expires_in: 3600,
          expires_at: 1700000000,
        },
      },
      error: null,
    })),
  },
};

jest.mock('@/libs/supabase/server', () => ({
  getServerClient: jest.fn(async () => mockSupabase),
}));

jest.mock('@/utils/authLogger', () => ({
  logSessionStart: jest.fn(),
  logSessionExpired: jest.fn(),
  logTokenError: jest.fn(),
  logAuthError: jest.fn(),
}));

describe('Auth Session API', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('returns 500 when supabase client is null', async () => {
    const { getServerClient } = require('@/libs/supabase/server');
    (getServerClient as jest.Mock).mockResolvedValueOnce(null);
    const { GET } = await import('@/app/api/auth/session/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/auth/session');
    const res = await GET(req);
    expect(res.status).toBe(500);
  });

  it('returns 401 when not authenticated', async () => {
    const { getServerClient } = require('@/libs/supabase/server');
    (getServerClient as jest.Mock).mockResolvedValueOnce({
      auth: {
        getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      },
    });
    const { GET } = await import('@/app/api/auth/session/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/auth/session');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns session data on success', async () => {
    const { GET } = await import('@/app/api/auth/session/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/auth/session');
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.access_token).toBe('test-token');
    expect(data.user.id).toBe('user-123');
  });
});
