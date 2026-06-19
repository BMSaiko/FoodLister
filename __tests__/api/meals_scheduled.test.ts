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
  return {
    NextRequest: MockNextRequest,
    NextResponse: MockNextResponse,
  };
});

const mockUser = { id: 'user-123', email: 'test@example.com' };

const mockMeals = [
  {
    id: 'm1', restaurant_id: 'r1', organizer_id: 'user-123',
    meal_date: '2024-06-15', meal_time: '19:00', meal_type: 'jantar',
    duration_minutes: 2, google_calendar_link: null,
    created_at: '2024-01-01',
    restaurants: { id: 'r1', name: 'Test Restaurant', location: 'Lisbon', description: 'Test', images: [] },
    organizer: { user_id: 'user-123', display_name: 'Test User', avatar_url: null, user_id_code: 'FL000001' },
    meal_participants: [],
  },
];

jest.mock('@/libs/supabase/server', () => ({
  getServerClient: jest.fn(async () => ({
    from: jest.fn((table: string) => {
      if (table === 'meal_participants') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        };
      }
      if (table === 'scheduled_meals') {
        const chain: any = {};
        chain.select = jest.fn(() => chain);
        chain.in = jest.fn(() => chain);
        chain.eq = jest.fn(() => chain);
        chain.ilike = jest.fn(() => chain);
        chain.gte = jest.fn(() => chain);
        chain.lte = jest.fn(() => chain);
        chain.order = jest.fn(() => chain);
        chain.range = jest.fn(() => Promise.resolve({ data: mockMeals, error: null }));
        return chain;
      }
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: { count: 1 }, error: null })),
        })),
      };
    }),
    auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })) },
  })),
}));

describe('Meals Scheduled API', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('returns 401 when not authenticated', async () => {
    const { getServerClient } = require('@/libs/supabase/server');
    (getServerClient as jest.Mock).mockResolvedValueOnce({
      from: jest.fn(() => ({ select: jest.fn(() => ({ eq: jest.fn(() => ({ in: jest.fn() })) })) })),
      auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })) },
    });
    const { GET } = await import('@/app/api/meals/scheduled/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/meals/scheduled');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns meals on success', async () => {
    const { GET } = await import('@/app/api/meals/scheduled/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/meals/scheduled');
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data).toBeDefined();
  });

  it('supports type filter', async () => {
    const { GET } = await import('@/app/api/meals/scheduled/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/meals/scheduled?type=organized');
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it('supports pagination', async () => {
    const { GET } = await import('@/app/api/meals/scheduled/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/meals/scheduled?page=1&limit=10');
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.page).toBe(1);
  });
});
