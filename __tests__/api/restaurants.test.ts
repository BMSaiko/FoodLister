// Mock next/server BEFORE any imports
jest.mock('next/server', () => {
  class MockNextRequest {
    public method: string;
    public headers: Map<string, string>;
    public nextUrl: URL;
    public url: string;
    
    constructor(input: string | URL, _init?: RequestInit) {
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
      next: () => ({
        headers: new Map(),
        headers: {
          set: jest.fn(),
        },
      }),
      json: (body: any, init?: { status?: number; headers?: Record<string, string> }) => ({
        status: init?.status || 200,
        json: () => Promise.resolve(body),
        headers: {
          set: jest.fn(),
        },
      }),
    },
  };
});

const mockRestaurants = [
  {
    id: '1',
    name: 'Restaurant A',
    rating: 4.5,
    price_per_person: 25,
    location: 'Lisbon',
    visited: true,
    cuisine_types: [],
    features: [],
    dietary_options: [],
    reviews: [],
  },
  {
    id: '2',
    name: 'Restaurant B',
    rating: 3.8,
    price_per_person: 15,
    location: 'Porto',
    visited: false,
    cuisine_types: [],
    features: [],
    dietary_options: [],
    reviews: [],
  },
];

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};

// Create a mock query builder that chains properly
const createMockQuery = (data: any) => ({
  order: jest.fn(() => ({
    order: jest.fn(() => Promise.resolve({ data, error: null, count: data?.length || 0 })),
  })),
  ilike: jest.fn(() => Promise.resolve({ data, error: null, count: data?.length || 0 })),
});

// Mock Supabase server client
jest.mock('@/libs/supabase/server', () => {
  const mockData = {
    get restaurants() { return mockRestaurants; },
    get user() { return mockUser; }
  };
  
  return {
    getServerClient: jest.fn(async () => ({
      from: jest.fn(() => ({
        select: jest.fn(() => createMockQuery(mockData.restaurants)),
        insert: jest.fn(() => Promise.resolve({ data: mockData.restaurants[0], error: null })),
      })),
      auth: {
        getUser: jest.fn(() => Promise.resolve({ data: { user: mockData.user }, error: null })),
      },
    })),
    getPublicServerClient: jest.fn(async () => ({
      from: jest.fn(() => ({
        select: jest.fn(() => createMockQuery(mockData.restaurants)),
        insert: jest.fn(() => Promise.resolve({ data: mockData.restaurants[0], error: null })),
      })),
      auth: {
        getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      },
    })),
  };
});

describe('Restaurants API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/restaurants', () => {
    it('returns restaurants for authenticated user', async () => {
      const { GET } = await import('@/app/api/restaurants/route');
      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/restaurants');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.restaurants).toBeDefined();
    });

    it('returns empty array when no restaurants found', async () => {
      const { getServerClient } = await import('@/libs/supabase/server');
      const emptyQuery = {
        order: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
        })),
      };
      (getServerClient as jest.Mock).mockResolvedValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => emptyQuery),
        })),
        auth: {
          getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
        },
      });

      const { GET } = await import('@/app/api/restaurants/route');
      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/restaurants');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.restaurants).toEqual([]);
    });

    it('returns 500 on database error', async () => {
      const { getServerClient } = await import('@/libs/supabase/server');
      const errorQuery = {
        order: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: null, error: { message: 'DB error' } })),
        })),
      };
      (getServerClient as jest.Mock).mockResolvedValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => errorQuery),
        })),
        auth: {
          getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
        },
      });

      const { GET } = await import('@/app/api/restaurants/route');
      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/restaurants');
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });
});