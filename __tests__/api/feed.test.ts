jest.mock('next/server', () => {
  class NextResponse {
    static json(body: unknown, init?: { status?: number }) {
      return { status: init?.status ?? 200, headers: new Map<string, string>(), json: () => Promise.resolve(body) };
    }
  }
  return { NextRequest: class {}, NextResponse };
});

const getClient = jest.fn();
jest.mock('@/libs/supabase/server', () => ({ getServerClient: () => getClient() }));

import { GET } from '@/app/api/feed/route';

const profiles = [
  { user_id: 'u1', display_name: 'Ana', avatar_url: null, user_id_code: 'FL1', public_profile: true },
  { user_id: 'u2', display_name: 'Bob', avatar_url: null, user_id_code: 'FL2', public_profile: false },
  { user_id: 'u3', display_name: 'Carla', avatar_url: 'c.png', user_id_code: 'FL3', public_profile: true },
];
const rest = (id: string, img: string) => ({ id, images: [img + '0', img + '1'], display_image_index: 1 });

// Responde por tabela; regista a ordem e o nº de consultas para medir round-trips.
function makeClient() {
  const calls: string[] = [];
  const data: Record<string, any[]> = {
    reviews: [
      { id: 'r1', user_id: 'u1', user_name: 'Ana', created_at: '2026-08-16T10:00:00Z', restaurants: { id: 'x1', slug: 'tasca', name: 'A Tasca', images: ['t0'], display_image_index: 0 } },
      { id: 'r2', user_id: 'u2', user_name: 'Bob', created_at: '2026-08-16T10:30:00Z', restaurants: { id: 'x2', slug: 'y', name: 'Y' } },
    ],
    lists: [{ id: 'l1', creator_id: 'u1', creator_name: 'Ana', slug: 'top', name: 'Top', created_at: '2026-08-16T12:00:00Z' }],
    user_follows: [{ id: 'f1', follower_id: 'u1', following_id: 'u3', created_at: '2026-08-16T11:00:00Z' }],
    profiles,
    list_restaurants: [
      { list_id: 'l1', restaurant_id: 'a', position: 0, restaurants: rest('a', 'A') },
      { list_id: 'l1', restaurant_id: 'b', position: 1, restaurants: rest('b', 'B') },
    ],
    restaurants: [rest('a', 'A'), rest('b', 'B')],
  };
  const client = {
    from: (table: string) => {
      calls.push(table);
      const chain: any = {};
      for (const m of ['select', 'order', 'limit', 'eq', 'in']) chain[m] = () => chain;
      chain.then = (res: any, rej: any) => Promise.resolve({ data: data[table] || [], error: null }).then(res, rej);
      return chain;
    },
  };
  return { client, calls };
}

const req = (qs = '') => ({ url: `http://x/api/feed${qs}` }) as any;

describe('GET /api/feed', () => {
  it('devolve 401 sem cliente', async () => {
    getClient.mockResolvedValue(null);
    const res: any = await GET(req());
    expect(res.status).toBe(401);
  });

  it('contrato do payload: ordem, actor, texto, link, capas, paginação', async () => {
    const { client } = makeClient();
    getClient.mockResolvedValue(client);
    const res: any = await GET(req());
    const body = await res.json();
    expect(body).toEqual({
      data: [
        { id: 'list-l1', type: 'list', actor: { name: 'Ana', avatar: null, user_id_code: 'FL1' }, text: 'criou a lista Top', link: '/lists/top', images: ['A1', 'B1'], createdAt: '2026-08-16T12:00:00Z' },
        { id: 'follow-f1', type: 'follow', actor: { name: 'Ana', avatar: null, user_id_code: 'FL1' }, text: 'começou a seguir Carla', link: '/users/FL3', images: [], createdAt: '2026-08-16T11:00:00Z' },
        { id: 'review-r1', type: 'review', actor: { name: 'Ana', avatar: null, user_id_code: 'FL1' }, text: 'fez um review em A Tasca', link: '/restaurants/tasca', images: ['t0'], createdAt: '2026-08-16T10:00:00Z' },
      ],
      total: 3, page: 1, limit: 15, hasMore: false,
    });
    expect(res.headers.get('Cache-Control')).toBe('private, no-store');
  });

  it('pagina com page e limit', async () => {
    const { client } = makeClient();
    getClient.mockResolvedValue(client);
    const res: any = await GET(req('?page=2&limit=2'));
    const body = await res.json();
    expect(body.data.map((d: any) => d.id)).toEqual(['review-r1']);
    expect(body).toMatchObject({ page: 2, limit: 2, total: 3, hasMore: false });
  });

  it('usa no máximo 5 consultas (3 fontes, perfis, capas)', async () => {
    const { client, calls } = makeClient();
    getClient.mockResolvedValue(client);
    await GET(req());
    expect(calls.length).toBeLessThanOrEqual(5);
  });
});
