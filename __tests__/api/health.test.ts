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

const mockQuery = jest.fn();
jest.mock('@/libs/supabase/server', () => ({
  getPublicServerClient: jest.fn(async () => ({
    from: () => ({ select: () => ({ limit: () => mockQuery() }) }),
  })),
}));

import { GET } from '@/app/api/health/route';

describe('GET /api/health', () => {
  it('returns ok status', async () => {
    const { NextRequest } = require('next/server');
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
    expect(body.uptime).toBeDefined();
    expect(body.environment).toBeDefined();
  });

  it('returns 200 status code', async () => {
    const { NextRequest } = require('next/server');
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    expect(response.status).toBe(200);
  });

  it('includes version info', async () => {
    const { NextRequest } = require('next/server');
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const body = await response.json();
    expect(body.version).toBeDefined();
  });

  it('não toca na BD sem ?db=1', async () => {
    mockQuery.mockClear();
    const { NextRequest } = require('next/server');
    const response = await GET(new NextRequest('http://localhost:3000/api/health'));
    const body = await response.json();
    expect(body.db).toBeUndefined();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('?db=1 mede o RTT com 3 queries', async () => {
    mockQuery.mockReset().mockResolvedValue({ error: null });
    const { NextRequest } = require('next/server');
    const response = await GET(new NextRequest('http://localhost:3000/api/health?db=1'));
    const body = await response.json();
    expect(mockQuery).toHaveBeenCalledTimes(3);
    expect(body.db.samplesMs).toHaveLength(3);
    expect(typeof body.db.rttMs).toBe('number');
  });

  it('?db=1 com erro da BD devolve rttMs null', async () => {
    mockQuery.mockReset().mockResolvedValue({ error: { message: 'x' } });
    const { NextRequest } = require('next/server');
    const response = await GET(new NextRequest('http://localhost:3000/api/health?db=1'));
    const body = await response.json();
    expect(body.db.rttMs).toBeNull();
    expect(body.db.error).toBe('query_failed');
  });
});
