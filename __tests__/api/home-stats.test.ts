jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: () => Promise.resolve(body),
    }),
  },
}));

const getClient = jest.fn();
jest.mock('@/libs/supabase/server', () => ({ getPublicServerClient: () => getClient() }));

import { GET } from '@/app/api/home/stats/route';

const row = (id: string, rating: number, review_count: number) => ({
  id, name: id, rating, review_count, price_per_person: 10, location: 'Porto', images: [], display_image_index: 0,
});

function client(top: any[], ratings: any[] = [{ rating: 4 }, { rating: 5 }]) {
  const topCalls: any = { order: [], limit: 0 };
  const make = (table: string, cols: string, opts?: any) => {
    if (opts?.head) return Promise.resolve({ count: 7 });
    const chain: any = {
      not: () => chain,
      gt: () => chain,
      order: (c: string, o: any) => { topCalls.order.push([c, o.ascending]); return chain; },
      limit: (n: number) => { topCalls.limit = n; return Promise.resolve({ data: top }); },
      then: (res: any) => res({ data: ratings }),
    };
    return chain;
  };
  return { client: { from: (t: string) => ({ select: (c: string, o?: any) => make(t, c, o) }) }, topCalls };
}

describe('GET /api/home/stats', () => {
  it('devolve contagens, média e top 10 por rating desc, review_count desc', async () => {
    const { client: c, topCalls } = client([row('a', 5, 3), row('b', 4.5, 9)]);
    getClient.mockResolvedValue(c);
    const res: any = await GET();
    const { data } = await res.json();
    expect(res.status).toBe(200);
    expect(data).toMatchObject({ restaurants: 7, users: 7, reviews: 7, avgRating: 4.5 });
    expect(data.topRestaurants.map((r: any) => r.id)).toEqual(['a', 'b']);
    expect(topCalls.order).toEqual([['rating', false], ['review_count', false]]);
    expect(topCalls.limit).toBe(10);
  });

  it('sem restaurantes: média 0 e lista vazia', async () => {
    getClient.mockResolvedValue(client([], []).client);
    const { data } = await ((await GET()) as any).json();
    expect(data.avgRating).toBe(0);
    expect(data.topRestaurants).toEqual([]);
  });

  it('500 sem backend', async () => {
    getClient.mockResolvedValue(null);
    const res: any = await GET();
    expect(res.status).toBe(500);
  });
});
