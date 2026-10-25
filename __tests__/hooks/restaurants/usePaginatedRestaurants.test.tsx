import { renderHook, waitFor, act } from '@testing-library/react';
import {
  usePaginatedRestaurants,
  buildRestaurantParams,
  PAGE_SIZE,
} from '@/hooks/restaurants/usePaginatedRestaurants';

jest.mock('@/hooks/auth/useAuthUser', () => ({ useAuthUser: () => ({ user: { id: 'u1' } }) }));

const fetchMock = jest.fn();
(global as unknown as { fetch: jest.Mock }).fetch = fetchMock;

const page = (n: number, total = 50, hasNext = true) => ({
  ok: true,
  json: async () => ({
    restaurants: Array.from({ length: PAGE_SIZE }, (_, i) => ({ id: `p${n}-${i}`, name: `R${n}-${i}` })),
    pagination: { page: n, limit: PAGE_SIZE, total, hasNext },
  }),
  text: async () => '',
});

const lastUrl = () => new URL(fetchMock.mock.calls.at(-1)![0], 'http://x');

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(async (url: string) => page(Number(new URL(url, 'http://x').searchParams.get('page'))));
});

describe('buildRestaurantParams', () => {
  it('envia todos os filtros ao servidor com limit=21', () => {
    const p = buildRestaurantParams(
      2,
      'sushi',
      { cuisines: ['Italiana', 'Japonesa'], priceMin: 10, priceMax: 30, ratingMin: 4, location: ' Porto ' },
      'rating',
      'desc'
    );
    expect(Object.fromEntries(p)).toEqual({
      page: '2',
      limit: '21',
      sort_by: 'rating',
      sort_direction: 'desc',
      search: 'sushi',
      cuisines: 'Italiana,Japonesa',
      price_min: '10',
      price_max: '30',
      rating_min: '4',
      location: 'Porto',
    });
  });

  it('omite filtros vazios e converte random em name', () => {
    const p = buildRestaurantParams(1, null, { cuisines: [], priceMin: null, location: '  ' }, 'random', 'asc');
    expect(Object.fromEntries(p)).toEqual({ page: '1', limit: '21', sort_by: 'name', sort_direction: 'asc' });
  });
});

describe('usePaginatedRestaurants', () => {
  it('nunca usa limit=all e lê o total de pagination.total', async () => {
    const { result } = renderHook(() => usePaginatedRestaurants({ filters: { cuisines: ['Italiana'] } }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(lastUrl().searchParams.get('limit')).toBe('21');
    expect(lastUrl().searchParams.get('cuisines')).toBe('Italiana');
    expect(fetchMock.mock.calls.every((c) => !String(c[0]).includes('limit=all'))).toBe(true);
    expect(result.current.total).toBe(50);
    expect(result.current.restaurants).toHaveLength(21);
  });

  it('loadMore acrescenta a página 2', async () => {
    const { result } = renderHook(() => usePaginatedRestaurants({}));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.restaurants).toHaveLength(42));
    expect(lastUrl().searchParams.get('page')).toBe('2');
  });

  it('mudar filtros reinicia na página 1 e substitui a lista', async () => {
    const { result, rerender } = renderHook(
      ({ cuisines }) => usePaginatedRestaurants({ filters: { cuisines } }),
      { initialProps: { cuisines: ['Italiana'] } }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.restaurants).toHaveLength(42));

    rerender({ cuisines: ['Japonesa'] });
    await waitFor(() => expect(lastUrl().searchParams.get('cuisines')).toBe('Japonesa'));
    await waitFor(() => expect(result.current.restaurants).toHaveLength(21));
    expect(lastUrl().searchParams.get('page')).toBe('1');
  });

  it('um objeto de filtros novo mas igual não refaz o pedido', async () => {
    const { result, rerender } = renderHook(() => usePaginatedRestaurants({ filters: { cuisines: ['Italiana'] } }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const calls = fetchMock.mock.calls.length;
    rerender();
    expect(fetchMock.mock.calls.length).toBe(calls);
  });

  it('ignora a resposta de filtros antigos', async () => {
    let releaseOld: (v: unknown) => void = () => {};
    fetchMock.mockImplementationOnce(() => new Promise((r) => (releaseOld = r)));
    const { result, rerender } = renderHook(
      ({ r }) => usePaginatedRestaurants({ filters: { ratingMin: r } }),
      { initialProps: { r: 3 } }
    );
    rerender({ r: 4 });
    await waitFor(() => expect(result.current.loading).toBe(false));
    const fresh = result.current.restaurants.map((x) => x.id);
    await act(async () => {
      releaseOld({ ok: true, json: async () => ({ restaurants: [{ id: 'old' }], pagination: { total: 1, hasNext: false } }) });
    });
    expect(result.current.restaurants.map((x) => x.id)).toEqual(fresh);
  });

  it('expõe o erro e esvazia a lista quando a API falha', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'boom', json: async () => ({}) });
    const { result } = renderHook(() => usePaginatedRestaurants({}));
    await waitFor(() => expect(result.current.error).toContain('500'));
    expect(result.current.restaurants).toEqual([]);
  });
});
