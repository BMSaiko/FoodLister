/**
 * @jest-environment node
 */

jest.mock('next/server', () => {
  class MockNextRequest {
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
  }
  class MockNextResponse {
    public status: number;
    public headers: Record<string, string>;
    public body: unknown;
    constructor(body: unknown, init?: { status?: number; headers?: Record<string, string> }) {
      this.body = body;
      this.status = init?.status ?? 200;
      this.headers = init?.headers ?? {};
    }
    json() {
      return Promise.resolve(this.body);
    }
    static json(body: unknown, init?: { status?: number }) {
      const res = new MockNextResponse(body, { status: init?.status ?? 200 });
      return res;
    }
  }
  return {
    NextRequest: MockNextRequest,
    NextResponse: MockNextResponse,
  };
});

// Mock Supabase server client
const mockSupabaseAuth = {
  getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
};

const mockSupabaseFrom = jest.fn();
const mockSupabase = {
  from: mockSupabaseFrom,
  auth: mockSupabaseAuth,
};

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => mockSupabase),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    getAll: jest.fn(() => []),
    set: jest.fn(),
  })),
}));

describe('Export API', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock: list not found
    mockSupabaseFrom.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Not found' } })),
        })),
        limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    });
  });

  it('returns 400 for invalid format', async () => {
    const { GET } = await import('@/app/api/lists/[id]/export/route');
    const { NextRequest } = require('next/server');

    const request = new NextRequest('http://localhost:3000/api/lists/123/export?format=xml');
    const response = await GET(request, { params: Promise.resolve({ id: '123' }) });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('Invalid format');
  });

  it('returns 404 when list not found', async () => {
    const { GET } = await import('@/app/api/lists/[id]/export/route');
    const { NextRequest } = require('next/server');

    const request = new NextRequest('http://localhost:3000/api/lists/123/export?format=json');
    const response = await GET(request, { params: Promise.resolve({ id: '123' }) });

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe('List not found');
  });

  it('returns JSON export when list is public', async () => {
    const mockList = { id: 'list-1', name: 'Public List', description: 'Test', is_public: true, creator_id: 'user-1' };
    const mockRestaurants = [
      { id: 'r1', name: 'Rest A', location: 'Lisboa', rating: 4.5, price_per_person: 20, visited: true, cuisine_types: [{ name: 'Italian' }] },
    ];

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'lists') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: mockList, error: null })),
            })),
          })),
        };
      }
      if (table === 'list_restaurants') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({ data: [{ restaurant_id: 'r1' }], error: null })),
            })),
          })),
        };
      }
      if (table === 'restaurants') {
        return {
          select: jest.fn(() => ({
            in: jest.fn(() => Promise.resolve({ data: mockRestaurants, error: null })),
          })),
        };
      }
      return { select: jest.fn(() => Promise.resolve({ data: [], error: null })) };
    });

    const { GET } = await import('@/app/api/lists/[id]/export/route');
    const { NextRequest } = require('next/server');

    const request = new NextRequest('http://localhost:3000/api/lists/list-1/export?format=json');
    const response = await GET(request, { params: Promise.resolve({ id: 'list-1' }) });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.listName).toBe('Public List');
    expect(body.totalRestaurants).toBe(1);
    expect(body.restaurants).toHaveLength(1);
    expect(body.restaurants[0].name).toBe('Rest A');
  });

  it('returns CSV export with correct content-type header', async () => {
    const mockList = { id: 'list-2', name: 'CSV List', is_public: true, creator_id: 'user-1' };
    const mockRestaurants = [
      { id: 'r1', name: 'Rest A', location: 'Lisboa', rating: 4.5, price_per_person: 20, visited: true, cuisine_types: [{ name: 'Italian' }] },
    ];

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'lists') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: mockList, error: null })),
            })),
          })),
        };
      }
      if (table === 'list_restaurants') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({ data: [{ restaurant_id: 'r1' }], error: null })),
            })),
          })),
        };
      }
      if (table === 'restaurants') {
        return {
          select: jest.fn(() => ({
            in: jest.fn(() => Promise.resolve({ data: mockRestaurants, error: null })),
          })),
        };
      }
      return { select: jest.fn(() => Promise.resolve({ data: [], error: null })) };
    });

    const { GET } = await import('@/app/api/lists/[id]/export/route');
    const { NextRequest } = require('next/server');

    const request = new NextRequest('http://localhost:3000/api/lists/list-2/export?format=csv');
    const response = await GET(request, { params: Promise.resolve({ id: 'list-2' }) });

    expect(response.status).toBe(200);
  });

  it('returns HTML export with correct content-type', async () => {
    const mockList = { id: 'list-3', name: 'HTML List', is_public: true, creator_id: 'user-1' };
    const mockRestaurants: any[] = [];

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'lists') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: mockList, error: null })),
            })),
          })),
        };
      }
      if (table === 'list_restaurants') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        };
      }
      if (table === 'restaurants') {
        return {
          select: jest.fn(() => ({
            in: jest.fn(() => Promise.resolve({ data: mockRestaurants, error: null })),
          })),
        };
      }
      return { select: jest.fn(() => Promise.resolve({ data: [], error: null })) };
    });

    const { GET } = await import('@/app/api/lists/[id]/export/route');
    const { NextRequest } = require('next/server');

    const request = new NextRequest('http://localhost:3000/api/lists/list-3/export?format=html');
    const response = await GET(request, { params: Promise.resolve({ id: 'list-3' }) });

    expect(response.status).toBe(200);
  });

  it('returns 401 for private list without auth', async () => {
    const mockList = { id: 'list-4', name: 'Private List', is_public: false, creator_id: 'user-1' };

    mockSupabaseFrom.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: mockList, error: null })),
        })),
      })),
    });

    const { GET } = await import('@/app/api/lists/[id]/export/route');
    const { NextRequest } = require('next/server');

    const request = new NextRequest('http://localhost:3000/api/lists/list-4/export?format=json');
    const response = await GET(request, { params: Promise.resolve({ id: 'list-4' }) });

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Authentication required');
  });
});
