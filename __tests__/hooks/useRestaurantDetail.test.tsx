import { renderHook, waitFor, act } from '@testing-library/react';
import { useRestaurantDetail } from '@/hooks/restaurants/useRestaurantDetail';

const get = jest.fn();
const post = jest.fn();
const del = jest.fn();

jest.mock('@/hooks/auth/usePublicApiClient', () => ({
  usePublicApiClient: () => ({ get, post, del, patch: jest.fn() }),
}));

const json = (data: unknown, ok = true) => ({ ok, json: async () => data, text: async () => '' });
const restaurant = { id: 'r1', name: 'Tasca', rating: 4, lists: [{ id: 'l1' }], cuisine_types: [{ id: 'c1' }] };
const review = (id: string) => ({ id, user_id: 'u1', user: {}, rating: 5 });

beforeEach(() => {
  jest.clearAllMocks();
  get.mockImplementation(async (url: string) => {
    if (url.startsWith('/api/reviews')) return json({ reviews: [review('a')] });
    return json({ restaurant });
  });
});

describe('useRestaurantDetail', () => {
  it('carrega restaurante, listas, cozinhas e avaliações', async () => {
    const { result } = renderHook(() => useRestaurantDetail('r1'));
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.restaurant?.name).toBe('Tasca');
    expect(result.current.lists).toHaveLength(1);
    expect(result.current.cuisineTypes).toHaveLength(1);
    expect(result.current.reviews).toHaveLength(1);
    expect(result.current.reviewCount).toBe(1);
  });

  it('notFound quando a API não devolve restaurante', async () => {
    get.mockImplementation(async (url: string) =>
      url.startsWith('/api/reviews') ? json({ reviews: [] }) : json({ error: 'x' }, false));
    const { result } = renderHook(() => useRestaurantDetail('r1'));
    await waitFor(() => expect(result.current.status).toBe('notFound'));
  });

  it('error quando o pedido do restaurante falha', async () => {
    get.mockRejectedValue(new Error('HTTP 500'));
    const { result } = renderHook(() => useRestaurantDetail('r1'));
    await waitFor(() => expect(result.current.status).toBe('error'));
  });

  it('avaliações falhadas não impedem a página', async () => {
    get.mockImplementation(async (url: string) => {
      if (url.startsWith('/api/reviews')) throw new Error('boom');
      return json({ restaurant });
    });
    const { result } = renderHook(() => useRestaurantDetail('r1'));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.reviews).toEqual([]);
  });

  it('onReviewSubmitted: nova soma 1, edição não soma; atualiza rating', async () => {
    post.mockResolvedValue(json({ restaurant: { rating: 4.5 } }));
    const { result } = renderHook(() => useRestaurantDetail('r1'));
    await waitFor(() => expect(result.current.status).toBe('ready'));

    await act(async () => { await result.current.onReviewSubmitted(review('b') as any); });
    expect(result.current.reviewCount).toBe(2);
    expect(post).toHaveBeenCalledWith('/api/restaurants/r1/rating', {});

    await act(async () => { await result.current.onReviewSubmitted({ ...review('b'), rating: 3 } as any); });
    expect(result.current.reviewCount).toBe(2);
    expect(result.current.reviews.find(r => r.id === 'b')?.rating).toBe(3);
  });

  it('deleteReview remove e decrementa só se a API aceitar', async () => {
    post.mockResolvedValue(json({ restaurant: { rating: 4 } }));
    const { result } = renderHook(() => useRestaurantDetail('r1'));
    await waitFor(() => expect(result.current.status).toBe('ready'));

    del.mockResolvedValueOnce(json({}, false));
    let ok = true;
    await act(async () => { ok = await result.current.deleteReview('a'); });
    expect(ok).toBe(false);
    expect(result.current.reviewCount).toBe(1);

    del.mockResolvedValueOnce(json({}));
    await act(async () => { ok = await result.current.deleteReview('a'); });
    expect(ok).toBe(true);
    expect(result.current.reviewCount).toBe(0);
    expect(result.current.reviews).toEqual([]);
  });

  it('deleteRestaurant devolve o resultado do DELETE', async () => {
    const { result } = renderHook(() => useRestaurantDetail('r1'));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    del.mockResolvedValueOnce(json({}));
    let ok = false;
    await act(async () => { ok = await result.current.deleteRestaurant(); });
    expect(ok).toBe(true);
    expect(del).toHaveBeenCalledWith('/api/restaurants/r1');
  });
});
