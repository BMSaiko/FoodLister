jest.mock('next/server', () => {
  class MockNextRequest {
    public method = 'GET';
    public nextUrl: URL;
    public url: string;
    public headers = new Map<string, string>();
    constructor(input: string) {
      this.url = input;
      this.nextUrl = new URL(input);
    }
  }
  class MockNextResponse {
    public headers = new Map<string, string>();
    static json(body: unknown, init?: { status?: number }) {
      return { status: init?.status ?? 200, json: () => Promise.resolve(body) };
    }
    static next() {
      return { headers: new Map() };
    }
  }
  return { NextRequest: MockNextRequest, NextResponse: MockNextResponse };
});

type Call = { method: string; args: unknown[] };
const calls: Call[] = [];
const selects: string[] = [];

// Query builder que regista as chamadas e resolve como um pedido Supabase
function makeQuery(result: { data: unknown[]; count: number }) {
  const q: Record<string, unknown> = {};
  const chainMethods = ['ilike', 'gte', 'lte', 'eq', 'in', 'order', 'range', 'not'];
  for (const m of chainMethods) {
    q[m] = (...args: unknown[]) => {
      calls.push({ method: m, args });
      return q;
    };
  }
  q.then = (resolve: (v: unknown) => unknown) => resolve({ data: result.data, count: result.count, error: null });
  return q;
}

const mockClient = {
  from: jest.fn(() => ({
    select: (cols: string) => {
      selects.push(cols);
      return makeQuery({ data: [], count: 57 });
    },
  })),
  auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })) },
};

jest.mock('@/libs/supabase/server', () => ({
  getServerClient: jest.fn(async () => mockClient),
  getPublicServerClient: jest.fn(async () => mockClient),
  requireUser: jest.fn(),
}));

const UUID = '123e4567-e89b-12d3-a456-426614174000';

// `t` torna cada pedido único para a cache em memória da rota
let seq = 0;
async function get(query: string) {
  calls.length = 0;
  selects.length = 0;
  const { GET } = await import('@/app/api/restaurants/route');
  const { NextRequest } = require('next/server');
  const response = await GET(new NextRequest(`http://localhost:3000/api/restaurants?${query}&t=${++seq}`));
  return { response, body: await response.json() };
}

const callsOf = (method: string) => calls.filter((c) => c.method === method);

describe('GET /api/restaurants — filtros no servidor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('filtra por cozinha (nomes) com junção !inner e devolve o total real', async () => {
    const { response, body } = await get('limit=21&cuisines=Italiana,Japonesa');
    expect(response.status).toBe(200);
    expect(selects[0]).toContain('cuisine_filter:restaurant_cuisine_types!inner');
    expect(callsOf('in')[0].args).toEqual(['cuisine_filter.cuisine_type.name', ['Italiana', 'Japonesa']]);
    expect(body.pagination.total).toBe(57);
    expect(body.pagination.limit).toBe(21);
  });

  it('filtra por cozinha com ids quando todos são UUID', async () => {
    await get(`limit=21&cuisines=${UUID}`);
    expect(callsOf('in')[0].args).toEqual(['cuisine_filter.cuisine_type.id', [UUID]]);
  });

  it('aplica rating_min, location e preço', async () => {
    await get('limit=21&rating_min=4.2&location=Porto&price_min=10&price_max=30');
    expect(callsOf('gte').map((c) => c.args)).toEqual(
      expect.arrayContaining([['rating', 4.2], ['price_per_person', 10]])
    );
    expect(callsOf('lte').map((c) => c.args)).toContainEqual(['price_per_person', 30]);
    expect(callsOf('ilike').map((c) => c.args)).toContainEqual(['location', '%Porto%']);
  });

  it('sem cozinhas não junta cuisine_filter nem usa in()', async () => {
    await get('limit=21');
    expect(selects[0]).not.toContain('cuisine_filter');
    expect(callsOf('in')).toHaveLength(0);
  });

  it('a página pedida usa range de 21 (nunca o conjunto completo)', async () => {
    await get('limit=21&page=3');
    expect(callsOf('range')[0].args).toEqual([42, 62]);
  });

  it('a cacheKey inclui os filtros: o mesmo URL repetido vem da cache, outro valor não', async () => {
    const { GET } = await import('@/app/api/restaurants/route');
    const { NextRequest } = require('next/server');
    const url = (r: number) => `http://localhost:3000/api/restaurants?limit=21&rating_min=${r}&cachekey=1`;
    calls.length = 0;
    await GET(new NextRequest(url(3)));
    const afterFirst = calls.length;
    await GET(new NextRequest(url(3)));
    expect(calls.length).toBe(afterFirst); // cache hit
    await GET(new NextRequest(url(4)));
    expect(calls.length).toBeGreaterThan(afterFirst); // filtro diferente = nova consulta
  });
});
