jest.mock('next/server', () => ({
  NextRequest: class {},
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      headers: new Map<string, string>(),
      json: () => Promise.resolve(body),
    }),
    next: () => ({ headers: new Map() }),
  },
}));

const selectMock = jest.fn();
const orderMock = jest.fn().mockResolvedValue({ data: [{ id: '1', name: 'A', icon: 'x' }], error: null });
const fromMock = jest.fn(() => ({ select: (cols: string) => { selectMock(cols); return { order: orderMock }; } }));
jest.mock('@/libs/supabase/server', () => ({
  getPublicServerClient: jest.fn(async () => ({ from: fromMock })),
  getServerClient: jest.fn(async () => null),
}));

import { cacheGet, cacheSet } from '@/libs/cache';
import { getServerClient } from '@/libs/supabase/server';
import { GET as cuisineGET, POST as cuisinePOST } from '@/app/api/cuisine-types/route';
import { GET as dietaryGET } from '@/app/api/dietary-options/route';
import { GET as featuresGET } from '@/app/api/features/route';

const routes: Array<[string, (r: any) => Promise<any>]> = [
  ['cuisine-types', cuisineGET],
  ['dietary-options', dietaryGET],
  ['features', featuresGET],
];

describe.each(routes)('GET /api/%s (dados de referência)', (_name, GET) => {
  it('responde com cache público s-maxage>=300 + stale-while-revalidate', async () => {
    const res = await GET({} as any);
    const cc = res.headers.get('Cache-Control') as string;
    expect(res.status).toBe(200);
    expect(cc).toMatch(/^public, s-maxage=(\d+), stale-while-revalidate=\d+$/);
    expect(Number(/s-maxage=(\d+)/.exec(cc)![1])).toBeGreaterThanOrEqual(300);
  });

  it('seleciona só colunas usadas pelo cliente (sem *)', async () => {
    selectMock.mockClear();
    await GET({} as any);
    for (const [cols] of selectMock.mock.calls) expect(cols).toBe('id, name, icon');
  });
});

describe('escritas de referência', () => {
  it('POST sem sessão responde private, no-store e não toca na cache', async () => {
    cacheSet('cuisine-types:all', [1], 300);
    const res = await cuisinePOST({ json: async () => ({}) } as any);
    expect(res.headers.get('Cache-Control')).toBe('private, no-store');
    expect(cacheGet('cuisine-types:all')).toEqual([1]);
  });

  it('POST com sucesso invalida a cache de referência', async () => {
    cacheSet('cuisine-types:all', [1], 300);
    const chain: any = {
      select: () => chain,
      eq: () => chain,
      single: jest.fn().mockResolvedValueOnce({ data: null }).mockResolvedValueOnce({ data: { id: '9' }, error: null }),
      insert: () => chain,
    };
    (getServerClient as jest.Mock).mockResolvedValueOnce({
      auth: { getUser: async () => ({ data: { user: { id: 'u' } }, error: null }) },
      from: () => chain,
    });
    const res = await cuisinePOST({ json: async () => ({ name: 'Nova' }) } as any);
    expect(res.status).toBe(200);
    expect(cacheGet('cuisine-types:all')).toBeUndefined();
  });
});
