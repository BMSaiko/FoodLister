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
    public url: string;
    public nextUrl: URL;
    public json: () => Promise<any>;
    constructor(input: string | URL, init?: any) {
      const urlStr = input instanceof URL ? input.toString() : input;
      this.url = urlStr;
      this.nextUrl = new URL(urlStr);
      this.method = init?.method || 'GET';
      this.json = async () => (init?.body ? JSON.parse(init.body) : {});
    }
  }
  return { NextRequest: MockNextRequest, NextResponse: MockNextResponse };
});

const mockUser = { id: 'user-123' };
const makeSupabase = () => {
  const chain: any = {};
  chain.update = jest.fn(() => chain);
  chain.delete = jest.fn(() => chain);
  chain.eq = jest.fn(() => chain);
  chain.select = jest.fn(() => chain);
  chain.single = jest.fn(() => Promise.resolve({ data: { id: 'c1', name: 'X' }, error: null }));
  chain.then = jest.fn((res: any) => res({ data: [], error: null }));
  return {
    from: jest.fn(() => chain),
    auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })) },
  };
};

jest.mock('@/libs/supabase/server', () => ({
  getServerClient: jest.fn(async () => makeSupabase()),
}));

describe('Campaign [id] API', () => {
  let spy: jest.SpyInstance;
  beforeEach(() => { spy = jest.spyOn(console, 'error').mockImplementation(() => {}); });
  afterEach(() => { spy.mockRestore(); });

  const req = (method: string, body?: any) =>
    new (require('next/server').NextRequest)('http://localhost:3000/api/marketing/campaigns/c1', {
      method,
      body: body ? JSON.stringify(body) : undefined,
    });

  it('PUT updates a campaign', async () => {
    const { PUT } = await import('@/app/api/marketing/campaigns/[id]/route');
    const res = await PUT(req('PUT', { name: 'X', status: 'active' }), { params: Promise.resolve({ id: 'c1' }) } as any);
    expect(res.status).toBe(200);
  });

  it('DELETE removes a campaign', async () => {
    const { DELETE } = await import('@/app/api/marketing/campaigns/[id]/route');
    const res = await DELETE(req('DELETE'), { params: Promise.resolve({ id: 'c1' }) } as any);
    expect(res.status).toBe(200);
  });

  it('returns 401 when unauthenticated', async () => {
    const { getServerClient } = require('@/libs/supabase/server');
    (getServerClient as jest.Mock).mockResolvedValueOnce(null);
    const { PUT } = await import('@/app/api/marketing/campaigns/[id]/route');
    const res = await PUT(req('PUT', {}), { params: Promise.resolve({ id: 'c1' }) } as any);
    expect(res.status).toBe(401);
  });
});
