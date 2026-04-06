import { NextRequest } from 'next/server';

// Mock Supabase server client
jest.mock('@/libs/supabase/server', () => ({
  getServerClient: jest.fn(async () => ({
    from: jest.fn((table: string) => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          order: jest.fn(() => ({
            ilike: jest.fn(() => Promise.resolve({ data: mockRestaurants, error: null, count: 2 })),
          })),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockNewRestaurant, error: null })),
          })),
        })),
      })),
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
    },
  })),
  getPublicServerClient: jest.fn(async () => ({
    from: jest.fn((table: string) => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          order: jest.fn(() => ({
            ilike: jest.fn(() => Promise.resolve({ data: mockRestaurants, error: null, count: 2 })),
          })),
        })),
      })),
    })),
  })),
}));

const mockRestaurants = [
  {
    id: '1',
    name: 'Restaurant A',
    rating: 4.5,
    price_per_person: 25,
    location: 'Lisbon',
    visited: true,
    cuisine_types: [{ cuisine_type: { id: '1', name: 'Portuguese' } }],
    features: [{ feature: { id: '1', name: 'Outdoor Seating' } }],
    dietary_options: [{ dietary_option: { id: '1', name: 'Vegetarian' } }],
    reviews: [{ count: 10 }],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Restaurant B',
    rating: 3.8,
    price_per_person: 15,
    location: 'Porto',
    visited: false,
    cuisine_types: [{ cuisine_type: { id: '2', name: 'Italian' } }],
    features: [],
    dietary_options: [],
    reviews: [{ count: 5 }],
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
];

const mockNewRestaurant = {
  id: '3',
  name: 'New Restaurant',
  description: 'A new restaurant',
  location: 'Lisbon',
  creator_id: 'user-123',
  creator_name: 'test@example.com',
  created_at: '2024-01-03T00:00:00Z',
  updated_at: '2024-01-03T00:00:00Z',
};

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};

describe('Restaurants API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/restaurants', () => {
    it('returns restaurants successfully', async () => {
      const { GET } = await import('@/app/api/restaurants/route');
      const request = new NextRequest('http://localhost:3000/api/restaurants');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.restaurants).toBeDefined();
      expect(Array.isArray(data.restaurants)).toBe(true);
    });

    it('applies search filter when provided', async () => {
      const { GET } = await import('@/app/api/restaurants/route');
      const request = new NextRequest('http://localhost:3000/api/restaurants?search=pizza');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.restaurants).toBeDefined();
    });

    it('includes cache headers in response', async () => {
      const { GET } = await import('@/app/api/restaurants/route');
      const request = new NextRequest('http://localhost:3000/api/restaurants');
      const response = await GET(request);

      expect(response.headers.get('Cache-Control')).toContain('public');
    });

    it('returns 500 on database error', async () => {
      const { getServerClient } = await import('@/libs/supabase/server');
      (getServerClient as jest.Mock).mockResolvedValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            order: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: null, error: { message: 'DB error' } })),
            })),
          })),
        })),
        auth: {
          getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
        },
      });

      const { GET } = await import('@/app/api/restaurants/route');
      const request = new NextRequest('http://localhost:3000/api/restaurants');
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/restaurants', () => {
    it('creates a new restaurant successfully', async () => {
      const { POST } = await import('@/app/api/restaurants/route');
      const request = new NextRequest('http://localhost:3000/api/restaurants', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Restaurant',
          description: 'A new restaurant',
          location: 'Lisbon',
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.restaurant).toBeDefined();
    });

    it('returns 401 when not authenticated', async () => {
      const { getServerClient } = await import('@/libs/supabase/server');
      (getServerClient as jest.Mock).mockResolvedValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
        })),
        auth: {
          getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
        },
      });

      const { POST } = await import('@/app/api/restaurants/route');
      const request = new NextRequest('http://localhost:3000/api/restaurants', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Restaurant' }),
      });
      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it('returns 400 when name is missing', async () => {
      const { POST } = await import('@/app/api/restaurants/route');
      const request = new NextRequest('http://localhost:3000/api/restaurants', {
        method: 'POST',
        body: JSON.stringify({ description: 'No name' }),
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('returns 400 for invalid coordinates', async () => {
      const { POST } = await import('@/app/api/restaurants/route');
      const request = new NextRequest('http://localhost:3000/api/restaurants', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Restaurant',
          latitude: 100, // Invalid latitude
          longitude: -8.5,
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('returns 400 when only one coordinate is provided', async () => {
      const { POST } = await import('@/app/api/restaurants/route');
      const request = new NextRequest('http://localhost:3000/api/restaurants', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Restaurant',
          latitude: 38.7,
          // Missing longitude
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });
});