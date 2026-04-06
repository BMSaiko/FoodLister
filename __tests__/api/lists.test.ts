import { NextRequest } from 'next/server';

// Mock Supabase server client
jest.mock('@/libs/supabase/server', () => ({
  getServerClient: jest.fn(async () => ({
    from: jest.fn((table: string) => ({
      select: jest.fn(() => ({
        or: jest.fn(() => ({
          ilike: jest.fn(() => Promise.resolve({ data: mockLists, error: null })),
        })),
        eq: jest.fn(() => ({
          ilike: jest.fn(() => Promise.resolve({ data: mockLists, error: null })),
        })),
        ilike: jest.fn(() => Promise.resolve({ data: mockLists, error: null })),
      })),
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
    },
  })),
}));

const mockLists = [
  {
    id: '1',
    name: 'My Favorite Restaurants',
    description: 'A list of my favorite restaurants',
    creator_id: 'user-123',
    is_public: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Places to Try',
    description: 'Restaurants I want to visit',
    creator_id: 'user-123',
    is_public: false,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
];

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};

describe('Lists API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/lists', () => {
    it('returns lists for authenticated user', async () => {
      const { GET } = await import('@/app/api/lists/route');
      const request = new NextRequest('http://localhost:3000/api/lists');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.lists).toBeDefined();
    });

    it('applies search filter when provided', async () => {
      const { GET } = await import('@/app/api/lists/route');
      const request = new NextRequest('http://localhost:3000/api/lists?search=Favorite');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.lists).toBeDefined();
    });

    it('returns empty array when no lists found', async () => {
      const { getServerClient } = await import('@/libs/supabase/server');
      (getServerClient as jest.Mock).mockResolvedValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            or: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
        auth: {
          getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
        },
      });

      const { GET } = await import('@/app/api/lists/route');
      const request = new NextRequest('http://localhost:3000/api/lists');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.lists).toEqual([]);
    });

    it('returns 500 on database error', async () => {
      const { getServerClient } = await import('@/libs/supabase/server');
      (getServerClient as jest.Mock).mockResolvedValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            or: jest.fn(() => Promise.resolve({ data: null, error: { message: 'DB error' } })),
          })),
        })),
        auth: {
          getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
        },
      });

      const { GET } = await import('@/app/api/lists/route');
      const request = new NextRequest('http://localhost:3000/api/lists');
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });
});