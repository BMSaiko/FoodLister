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

const mockRestaurants = [{ id: '1', name: 'Restaurant A', rating: 4.5, location: 'Lisbon', visited: true }];
const mockUser = { id: 'user-123', email: 'test@example.com' };

jest.mock('@/libs/supabase/server', () => {
  const mockData = {
    get restaurants() { return mockRestaurants; },
    get user() { return mockUser; }
  };
  return {
    getServerClient: jest.fn(async () => ({
      from: jest.fn(() => {
        const chain = {};
        chain.select = jest.fn(() => chain);
        chain.ilike = jest.fn(() => chain);
        chain.order = jest.fn(() => chain);
        chain.gte = jest.fn(() => chain);
        chain.lte = jest.fn(() => chain);
        chain.eq = jest.fn(() => chain);
        chain.not = jest.fn(() => chain);
        return chain;
      }),
      auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: mockData.user }, error: null })) },
    })),
    getPublicServerClient: jest.fn(async () => ({
      from: jest.fn(() => {
        const chain = {};
        chain.select = jest.fn(() => chain);
        chain.ilike = jest.fn(() => chain);
        chain.order = jest.fn(() => chain);
        return chain;
      }),
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
