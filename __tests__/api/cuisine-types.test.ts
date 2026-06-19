jest.mock('next/server', () => {
  class MockNextRequest {
    constructor(input: string | URL) { this.url = input instanceof URL ? input.toString() : input; this.nextUrl = new URL(this.url); this.method = 'GET'; this.headers = new Map(); }
    public url: string; public nextUrl: URL; public method: string; public headers: Map<string, string>;
  }
  function MockNextResponse(this: any) {}
  (MockNextResponse as any).json = (body: any, init?: { status?: number }) => ({ status: init?.status || 200, json: () => Promise.resolve(body) });
  return { NextRequest: MockNextRequest, NextResponse: MockNextResponse };
});

// Mock returns null client = database error
jest.mock('@/libs/supabase/server', () => ({
  getPublicServerClient: jest.fn().mockResolvedValue(null),
  getServerClient: jest.fn().mockResolvedValue(null),
}));

import { GET } from '@/app/api/cuisine-types/route';

describe('GET /api/cuisine-types', () => {
  it('returns 500 when database client unavailable', async () => {
    const request = new (require('next/server').NextRequest)('http://localhost:3000/api/cuisine-types');
    const response = await GET(request);
    expect(response.status).toBe(500);
  });
});

