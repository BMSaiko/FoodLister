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
  return { NextRequest: MockNextRequest, NextResponse: MockNextResponse };
});

jest.mock('@/libs/search', () => ({
  haversineDistance: jest.fn(() => 1.5),
  isValidCoordinates: jest.fn(() => true),
}));

jest.mock('@/libs/supabase/server', () => ({
  getPublicServerClient: jest.fn(async () => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        not: jest.fn(() => ({
          not: jest.fn(() => Promise.resolve({
            data: [
              {
                id: 'r1', name: 'Restaurant 1', description: 'Test',
                image_url: null, price_per_person: 15, rating: 4.5,
                location: 'Lisbon', source_url: null, creator: null,
                menu_url: null, visited: false, phone_numbers: [],
                creator_id: 'u1', creator_name: 'Test User',
                created_at: '2024-01-01', updated_at: '2024-01-01',
                images: [], display_image_index: -1,
                menu_links: [], menu_images: [],
                latitude: 38.7223, longitude: -9.1393,
                review_count: 5, opening_hours: null,
              },
            ],
            error: null,
          })),
        })),
      })),
    })),
  })),
}));

describe('Restaurants Nearby API', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('returns 400 for invalid coordinates', async () => {
    const { isValidCoordinates } = require('@/libs/search');
    (isValidCoordinates as jest.Mock).mockReturnValueOnce(false);
    const { GET } = await import('@/app/api/restaurants/nearby/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/restaurants/nearby?lat=999&lng=999');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('returns restaurants with distance', async () => {
    const { GET } = await import('@/app/api/restaurants/nearby/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/restaurants/nearby?lat=38.7223&lng=-9.1393&radius=10');
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.restaurants).toBeDefined();
    expect(data.restaurants.length).toBe(1);
    expect(data.restaurants[0].distance).toBe(1.5);
    expect(data.meta.center.lat).toBe(38.7223);
  });

  it('uses default radius when not provided', async () => {
    const { GET } = await import('@/app/api/restaurants/nearby/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/restaurants/nearby?lat=38.7223&lng=-9.1393');
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.meta.radius_km).toBe(10);
  });

  it('supports sort_by parameter', async () => {
    const { GET } = await import('@/app/api/restaurants/nearby/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/restaurants/nearby?lat=38.7223&lng=-9.1393&sort_by=rating');
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.meta.sort_by).toBe('rating');
  });

  it('returns 500 when client fails to initialize', async () => {
    const { getPublicServerClient } = await import('@/libs/supabase/server');
    (getPublicServerClient as jest.Mock).mockResolvedValueOnce(null);
    const { GET } = await import('@/app/api/restaurants/nearby/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/restaurants/nearby?lat=38.7223&lng=-9.1393');
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});
