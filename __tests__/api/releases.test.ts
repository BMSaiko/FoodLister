jest.mock('next/server', () => {
  const MockNextRequest = class {
    public method = 'GET';
    public nextUrl: URL;
    public url: string;
    constructor(input: string | URL) {
      this.url = input.toString();
      this.nextUrl = new URL(this.url);
    }
  };
  return {
    NextRequest: MockNextRequest,
    NextResponse: {
      json: (body: unknown, init?: { status?: number }) => ({
        status: init?.status ?? 200,
        json: () => Promise.resolve(body),
      }),
    },
  };
});

jest.mock('@/libs/cache', () => ({
  cacheOrSet: jest.fn(async (_key: string, fn: () => Promise<unknown>) => fn()),
}));

const range = jest.fn();
const order = jest.fn(() => ({ range }));
const select = jest.fn(() => ({ order }));
const from = jest.fn(() => ({ select }));
const getPublicServerClient = jest.fn();

jest.mock('@/libs/supabase/server', () => ({
  getPublicServerClient: (...a: unknown[]) => getPublicServerClient(...a),
}));

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/releases/route';

const row = (n: number) => ({
  version: `1.${n}.0`,
  released_at: `2026-11-${String(10 + n).padStart(2, '0')}`,
  title: `Versão 1.${n}.0`,
  items: { novo: [`item ${n}`], melhorado: [], corrigido: [] },
});

const call = (qs = '') => GET(new NextRequest(`http://localhost:3000/api/releases${qs}`));

beforeEach(() => {
  jest.clearAllMocks();
  getPublicServerClient.mockResolvedValue({ from });
  range.mockResolvedValue({ data: [row(2), row(1)], error: null });
});

describe('GET /api/releases', () => {
  it('devolve 200 com releases mapeadas, page e hasMore', async () => {
    const res = await call();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toEqual({
      releases: [
        { version: '1.2.0', releasedAt: '2026-11-12', title: 'Versão 1.2.0', items: row(2).items },
        { version: '1.1.0', releasedAt: '2026-11-11', title: 'Versão 1.1.0', items: row(1).items },
      ],
      page: 1,
      hasMore: false,
    });
    expect(from).toHaveBeenCalledWith('release_notes');
    expect(order).toHaveBeenCalledWith('released_at', { ascending: false });
  });

  it('usa limit 10 e page 1 por defeito (pede limit+1 para hasMore)', async () => {
    await call();
    expect(range).toHaveBeenCalledWith(0, 10);
  });

  it('calcula o intervalo da página e hasMore quando há mais uma linha', async () => {
    range.mockResolvedValue({ data: [row(3), row(2), row(1)], error: null });
    const res = await call('?page=2&limit=2');
    const body = await res.json();
    expect(range).toHaveBeenCalledWith(2, 4);
    expect(body.releases).toHaveLength(2);
    expect(body.page).toBe(2);
    expect(body.hasMore).toBe(true);
  });

  it('faz clamp do limit a 50', async () => {
    await call('?limit=999');
    expect(range).toHaveBeenCalledWith(0, 50);
  });

  it.each(['?page=0', '?page=-1', '?page=abc', '?page=1001','?limit=0', '?limit=-3', '?limit=x'])(
    'devolve 400 para %s',
    async (qs) => {
      const res = await call(qs);
      const body = await res.json();
      expect(res.status).toBe(400);
      expect(body.code).toBe('VALIDATION_ERROR');
      expect(range).not.toHaveBeenCalled();
    },
  );

  it('devolve lista vazia sem erro', async () => {
    range.mockResolvedValue({ data: [], error: null });
    const res = await call();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ releases: [], page: 1, hasMore: false });
  });

  it('devolve 500 DATABASE_ERROR sem cliente', async () => {
    getPublicServerClient.mockResolvedValue(null);
    const res = await call();
    expect(res.status).toBe(500);
    expect((await res.json()).code).toBe('DATABASE_ERROR');
  });

  it('devolve 500 quando a query falha', async () => {
    range.mockResolvedValue({ data: null, error: { message: 'boom' } });
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const res = await call();
    expect(res.status).toBe(500);
  });
});
