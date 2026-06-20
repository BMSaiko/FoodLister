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
  return {
    NextRequest: MockNextRequest,
    NextResponse: {
      json: (body: unknown, init?: { status?: number }) => ({
        status: init?.status ?? 200,
        json: () => Promise.resolve(body),
      }),
      next: () => ({ headers: new Map() }),
    },
  };
});

// Mock returns null client = database error
jest.mock('@/libs/supabase/server', () => ({
  getPublicServerClient: jest.fn().mockResolvedValue(null),
  getServerClient: jest.fn().mockResolvedValue(null),
}));

import { GET } from '@/app/api/cuisine-types/route';

describe('GET /api/cuisine-types', () => {
  it('returns 500 when database client unavailable', async () => {
    const { NextRequest } = require('next/server');
    const request = new NextRequest('http://localhost:3000/api/cuisine-types');
    const response = await GET(request);
    expect(response.status).toBe(500);
  });
});
