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
    public headers: Map<string, string>;
    public url: string;
    public nextUrl: URL;
    constructor(input: string | URL, init?: { method?: string; body?: any }) {
      const urlStr = input instanceof URL ? input.toString() : input;
      this.url = urlStr;
      this.nextUrl = new URL(urlStr);
      this.method = init?.method || 'POST';
      this.headers = new Map();
      this._body = init?.body;
    }
    async json() {
      if (typeof this._body === 'string') return JSON.parse(this._body);
      return this._body;
    }
    private _body: any;
  }
  return {
    NextRequest: MockNextRequest,
    NextResponse: MockNextResponse,
  };
});

const mockUser = { id: 'user-123', email: 'test@example.com' };

function createChainableMock(finalValue: any) {
  const chain: any = {};
  chain.select = jest.fn(() => chain);
  chain.eq = jest.fn(() => chain);
  chain.single = jest.fn(() => finalValue);
  chain.maybeSingle = jest.fn(() => finalValue);
  chain.insert = jest.fn(() => chain);
  chain.update = jest.fn(() => chain);
  chain.delete = jest.fn(() => chain);
  chain.in = jest.fn(() => Promise.resolve({ data: [], error: null }));
  return chain;
}

const mockSupabaseClient = {
  from: jest.fn(() => createChainableMock({ data: { organizer_id: 'user-123' }, error: null })),
  auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })) },
};

jest.mock('@/libs/supabase/server', () => ({
  getServerClient: jest.fn(async () => mockSupabaseClient),
}));

describe('Meals Participants API', () => {
  let consoleErrorSpy: jest.SpyInstance;
  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
    // Re-set base mocks after clearAllMocks
    const { getServerClient } = require('@/libs/supabase/server');
    (getServerClient as jest.Mock).mockResolvedValue(mockSupabaseClient);
    mockSupabaseClient.from.mockImplementation(() => createChainableMock({ data: { organizer_id: 'user-123' }, error: null }));
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
  });
  afterEach(() => { consoleErrorSpy.mockRestore(); });

  describe('POST /api/meals/participants', () => {
    it('returns 401 when not authenticated', async () => {
      const { getServerClient } = require('@/libs/supabase/server');
      (getServerClient as jest.Mock).mockResolvedValueOnce(null);
      const { POST } = await import('@/app/api/meals/participants/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost:3000/api/meals/participants', {
        method: 'POST',
        body: { mealId: 'meal-1', userIds: ['u2'] },
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it('returns 400 when mealId is missing', async () => {
      const { POST } = await import('@/app/api/meals/participants/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost:3000/api/meals/participants', {
        method: 'POST',
        body: { userIds: ['u2'] },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('returns 400 when userIds is not an array', async () => {
      const { POST } = await import('@/app/api/meals/participants/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost:3000/api/meals/participants', {
        method: 'POST',
        body: { mealId: 'meal-1', userIds: 'invalid' },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('returns 200 on successful participant add', async () => {
      // First call: check organizer, Second call: insert participants
      mockSupabaseClient.from.mockImplementationOnce(() => createChainableMock({
        data: { organizer_id: 'user-123' },
        error: null,
      }));
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        insert: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({
            data: [{ id: 'p1', user_id: 'u2', status: 'pending', profiles: null }],
            error: null,
          })),
        })),
      }));
      const { POST } = await import('@/app/api/meals/participants/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost:3000/api/meals/participants', {
        method: 'POST',
        body: { mealId: 'meal-1', userIds: ['u2'] },
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    });

    it('returns 403 when user is not organizer', async () => {
      mockSupabaseClient.from.mockImplementation(() => createChainableMock({
        data: { organizer_id: 'other-user' },
        error: null,
      }));
      const { POST } = await import('@/app/api/meals/participants/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost:3000/api/meals/participants', {
        method: 'POST',
        body: { mealId: 'meal-1', userIds: ['u2'] },
      });
      const res = await POST(req);
      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/meals/participants', () => {
    it('returns 401 when not authenticated', async () => {
      const { getServerClient } = require('@/libs/supabase/server');
      (getServerClient as jest.Mock).mockResolvedValueOnce(null);
      const { PATCH } = await import('@/app/api/meals/participants/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost:3000/api/meals/participants', {
        method: 'PATCH',
        body: { mealId: 'meal-1', status: 'accepted' },
      });
      const res = await PATCH(req);
      expect(res.status).toBe(401);
    });

    it('returns 400 when mealId is missing', async () => {
      const { PATCH } = await import('@/app/api/meals/participants/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost:3000/api/meals/participants', {
        method: 'PATCH',
        body: { status: 'accepted' },
      });
      const res = await PATCH(req);
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid status', async () => {
      const { PATCH } = await import('@/app/api/meals/participants/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost:3000/api/meals/participants', {
        method: 'PATCH',
        body: { mealId: 'meal-1', status: 'invalid' },
      });
      const res = await PATCH(req);
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/meals/participants', () => {
    it('returns 400 when mealId is missing', async () => {
      const { DELETE } = await import('@/app/api/meals/participants/route');
      const { NextRequest } = require('next/server');
      const req = new NextRequest('http://localhost:3000/api/meals/participants', {
        method: 'DELETE',
        body: {},
      });
      const res = await DELETE(req);
      expect(res.status).toBe(400);
    });
  });
});
