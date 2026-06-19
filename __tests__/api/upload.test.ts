// Polyfill File for Node.js test environment
class MockFile {
  name: string;
  type: string;
  size: number;
  private _content: ArrayBuffer;
  constructor(content: string[], name: string, options: { type: string }) {
    const str = content[0] || '';
    this.name = name;
    this.type = options.type;
    this.size = str.length;
    const buf = Buffer.from(str);
    this._content = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }
  arrayBuffer() { return Promise.resolve(this._content); }
  stream() { return new ReadableStream(); }
  text() { return Promise.resolve(new TextDecoder().decode(this._content)); }
  slice() { return this; }
  get [Symbol.toStringTag]() { return 'File'; }
}
global.File = MockFile as any;

// Mock next/server
jest.mock('next/server', () => {
  class MockNextRequest {
    public method: string;
    public nextUrl: URL;
    public url: string;
    public headers: Map<string, string>;
    public _mockFormData: any = null;
    constructor(input: string | URL, init?: { method?: string; headers?: Record<string, string>; body?: any; __mockFormData?: any }) {
      const urlStr = input instanceof URL ? input.toString() : input;
      this.url = urlStr;
      this.nextUrl = new URL(urlStr);
      this.method = init?.method || 'POST';
      this.headers = new Map(Object.entries(init?.headers || {}));
      this._body = init?.body;
      // Store mock formData if body is a special marker
      if (init?.__mockFormData) {
        this._mockFormData = init.__mockFormData;
      }
    }
    async json() {
      if (typeof this._body === 'string') return JSON.parse(this._body);
      return this._body;
    }
    async formData() {
      return this._mockFormData;
    }
    private _body: any;
  }
  function MockNextResponse(this: any) {}
  (MockNextResponse as any).json = (body: any, init?: { status?: number }) => ({
    status: init?.status || 200,
    json: () => Promise.resolve(body),
  });
  return { NextRequest: MockNextRequest, NextResponse: MockNextResponse };
});

// Mock crypto for signature generation
jest.mock('crypto', () => ({
  createHash: jest.fn(() => ({
    update: jest.fn(() => ({
      digest: jest.fn(() => 'mock-signature'),
    })),
  })),
}));

describe('Upload API', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_UPLOAD_PRESET: 'test-preset',
      CLOUDINARY_API_KEY: 'test-key',
      CLOUDINARY_API_SECRET: 'test-secret',
    };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ secure_url: 'https://res.cloudinary.com/test/image/upload/test.jpg' }),
      })
    ) as jest.Mock;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns 400 for multipart upload with no file', async () => {
    const { POST } = await import('@/app/api/upload/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      headers: { 'content-type': 'multipart/form-data' },
      __mockFormData: { get: () => null },
    } as any);
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 for non-image file type', async () => {
    const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const { POST } = await import('@/app/api/upload/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      headers: { 'content-type': 'multipart/form-data' },
      __mockFormData: { get: () => mockFile },
    } as any);
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when missing required fields for base64 upload', async () => {
    const { POST } = await import('@/app/api/upload/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ imageData: 'base64data' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 500 when Cloudinary config missing', async () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const { POST } = await import('@/app/api/upload/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ imageData: 'base64data', mimeType: 'image/jpeg' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it('returns 200 with URL on successful base64 upload', async () => {
    const { POST } = await import('@/app/api/upload/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ imageData: 'iVBORw0KGgo=', mimeType: 'image/png' }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.url).toBeDefined();
  });

  it('returns 400 for unsupported content type', async () => {
    const { POST } = await import('@/app/api/upload/route');
    const { NextRequest } = require('next/server');
    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: 'test',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
