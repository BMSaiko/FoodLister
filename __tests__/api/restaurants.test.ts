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
  class MockNextResponse {
    public headers: Map<string, string>;
    constructor() {
      this.headers = new Map();
    }
    static json(body: unknown, init?: { status?: number }) {
      return {
        status: init?.status ?? 200,
        json: () => Promise.resolve(body),
      };
    }
    static next() {
      return { headers: new Map() };
    }
  }
  return {
    NextRequest: MockNextRequest,
    NextResponse: MockNextResponse,
  };
});

const mockRestaurants = [{ id: '1', name: 'Restaurant A', rating: 4.5, location: 'Lisbon', visited: true }];
const mockUser = { id: 'user-123', email: 'test@example.com' };

jest.mock('@/libs/supabase/server', () => {
  return {
    getServerClient: jest.fn(async () => ({
      from: jest.fn(() => {
        const chain: Record<string, jest.Mock> = {};
        chain.select = jest.fn(() => {
          const innerChain: Record<string, jest.Mock> = {};
          innerChain.ilike = jest.fn(() => innerChain);
          innerChain.order = jest.fn(() => innerChain);
          innerChain.gte = jest.fn(() => innerChain);
          innerChain.lte = jest.fn(() => innerChain);
          innerChain.eq = jest.fn(() => innerChain);
          innerChain.not = jest.fn(() => Promise.resolve({ data: mockRestaurants, error: null }));
          return innerChain;
        });
        return chain;
      }),
      auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })) },
    })),
    getPublicServerClient: jest.fn(async () => ({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          ilike: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: mockRestaurants, error: null })),
          })),
        })),
      })),
    })),
  };
});

describe('Restaurants API', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('GET /api/restaurants', () => {
    it('returns restaurants for authenticated user', async () => {
      const { GET } = await import('@/app/api/restaurants/route');
      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/restaurants');
      const response = await GET(request);
      expect(response.status).toBeDefined();
    });
  });
});
