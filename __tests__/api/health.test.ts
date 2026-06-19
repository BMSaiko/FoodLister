jest.mock('next/server', () => {
  class MockNextRequest {
    constructor(input: string | URL) { this.url = input instanceof URL ? input.toString() : input; this.nextUrl = new URL(this.url); this.method = 'GET'; this.headers = new Map(); }
    public url: string; public nextUrl: URL; public method: string; public headers: Map<string, string>;
  }
  function MockNextResponse(this: any) {}
  (MockNextResponse as any).json = (body: any, init?: { status?: number }) => ({ status: init?.status || 200, json: () => Promise.resolve(body) });
  return { NextRequest: MockNextRequest, NextResponse: MockNextResponse };
});

import { GET } from '@/app/api/health/route';

describe('GET /api/health', () => {
  it('returns ok status', async () => {
    const request = new (require('next/server').NextRequest)('http://localhost:3000/api/health');
    const response = await GET(request);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
    expect(body.uptime).toBeDefined();
    expect(body.environment).toBeDefined();
  });

  it('returns 200 status code', async () => {
    const request = new (require('next/server').NextRequest)('http://localhost:3000/api/health');
    const response = await GET(request);
    expect(response.status).toBe(200);
  });

  it('includes version info', async () => {
    const request = new (require('next/server').NextRequest)('http://localhost:3000/api/health');
    const response = await GET(request);
    const body = await response.json();
    expect(body.version).toBeDefined();
  });
});

