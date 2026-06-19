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

jest.mock('@/utils/googleMapsExtractor', () => ({
  isValidGoogleMapsUrl: jest.fn((url: string) => url.includes('google.com/maps') || url.includes('maps.app.goo.gl')),
}));

describe('Resolve Google Maps URL API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn() as jest.Mock;
  });

  it('returns 400 when url parameter is missing', async () => {
    const { GET } = await import('@/app/api/resolve-google-maps-url/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/resolve-google-maps-url');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid Google Maps URL', async () => {
    const { GET } = await import('@/app/api/resolve-google-maps-url/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/resolve-google-maps-url?url=https://example.com');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('resolves a valid Google Maps URL', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      url: 'https://www.google.com/maps/place/Resolved+Place/@38.7223,-9.1393,17z',
    });
    const { GET } = await import('@/app/api/resolve-google-maps-url/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/resolve-google-maps-url?url=https://maps.app.goo.gl/abc123');
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.finalUrl).toBeDefined();
  });

  it('returns 500 when fetch fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    const { GET } = await import('@/app/api/resolve-google-maps-url/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/resolve-google-maps-url?url=https://maps.app.goo.gl/abc123');
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});
