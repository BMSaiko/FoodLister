jest.mock('next/server', () => ({
  NextRequest: class {
    url: string; nextUrl: URL; headers = new Map<string, string>(); method = 'GET';
    constructor(u: string) { this.url = u; this.nextUrl = new URL(u); }
  },
  NextResponse: {
    json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
      status: init?.status ?? 200, headers: new Map(Object.entries(init?.headers || {})), json: () => Promise.resolve(body),
    }),
    next: () => ({ headers: new Map() }),
  },
}));

type Call = { table: string; select: string; opts?: any; range?: [number, number] };
const calls: Call[] = [];
let total = 0;
let rows: any[] = [];

function makeClient() {
  return {
    from: (table: string) => ({
      select: (select: string, opts?: any) => {
        const call: Call = { table, select, opts };
        calls.push(call);
        const chain: any = {
          range: (a: number, b: number) => { call.range = [a, b]; return chain; },
          then: (res: any) => res(opts?.head
            ? { count: total, data: null, error: null }
            : { data: rows.slice(call.range?.[0] ?? 0, (call.range?.[1] ?? rows.length) + 1), error: null }),
        };
        for (const m of ['ilike', 'gte', 'lte', 'in', 'order', 'eq', 'not']) chain[m] = () => chain;
        return chain;
      },
    }),
  };
}

jest.mock('@/libs/supabase/server', () => ({
  getServerClient: jest.fn(async () => null),
  getPublicServerClient: jest.fn(async () => makeClient()),
  requireUser: jest.fn(),
}));
jest.mock('@/libs/creatorCodes', () => ({ attachCreatorCodes: jest.fn(async () => undefined) }));

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/restaurants/route';
import { cacheInvalidatePrefix } from '@/libs/cache';

const mk = (n: number) => Array.from({ length: n }, (_, i) => ({
  id: `r${i}`, name: `R${i}`, rating: 4, price_per_person: 10, location: 'Porto', created_at: '2026-01-01',
  images: [], display_image_index: 0, cuisine_types: [], features: [], dietary_options: [], reviews: [{ count: 2 }],
}));
const get = async (qs: string) => {
  calls.length = 0;
  const res: any = await GET(new NextRequest('http://x/api/restaurants?' + qs) as any);
  return { res, body: await res.json() };
};
const restaurantQueries = () => calls.filter((c) => c.table === 'restaurants');

describe('GET /api/restaurants: consultas e contrato', () => {
  beforeEach(() => cacheInvalidatePrefix('restaurants:'));

  it('página incompleta: total exato sem consulta de contagem', async () => {
    rows = mk(3); total = 3;
    const { body } = await get('limit=25&page=1');
    expect(body.restaurants).toHaveLength(3);
    expect(body.pagination).toMatchObject({ page: 1, limit: 25, total: 3, totalPages: 1, hasNext: false, hasPrev: false });
    expect(restaurantQueries().filter((c) => c.opts?.head)).toHaveLength(0);
    expect(restaurantQueries()).toHaveLength(1);
  });

  it('página 2 incompleta: total = offset + linhas', async () => {
    rows = mk(30); total = 30;
    const { body } = await get('limit=25&page=2');
    expect(body.restaurants).toHaveLength(5);
    expect(body.pagination).toMatchObject({ page: 2, total: 30, hasNext: false, hasPrev: true });
    expect(restaurantQueries()).toHaveLength(1);
  });

  it('página cheia: contagem exata em paralelo (2 consultas)', async () => {
    rows = mk(25); total = 80;
    const { body } = await get('limit=25&page=1');
    expect(body.restaurants).toHaveLength(25);
    expect(body.pagination).toMatchObject({ total: 80, totalPages: 4, hasNext: true });
    expect(restaurantQueries()).toHaveLength(2);
  });

  it('limit=all: 1 consulta, total = linhas', async () => {
    rows = mk(40); total = 40;
    const { body } = await get('limit=all');
    expect(body.restaurants).toHaveLength(40);
    expect(body.pagination.total).toBe(40);
    expect(restaurantQueries()).toHaveLength(1);
  });

  it('pedido público não devolve campos privados', async () => {
    rows = mk(1).map((r) => ({ ...r, source_url: 'u', creator_id: 'c', creator_name: 'n', phone_numbers: ['1'] }));
    total = 1;
    const { body } = await get('limit=25');
    for (const k of ['source_url', 'creator_id', 'creator_name', 'phone_numbers']) expect(body.restaurants[0]).not.toHaveProperty(k);
  });
});
