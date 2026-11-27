import { renderHook, waitFor } from '@testing-library/react';
import { useUserData } from '@/hooks/data/useUserData';

const get = jest.fn();
const getCache = jest.fn();
const setWithTTL = jest.fn();
const removeByPrefix = jest.fn();

let unstable = false;
jest.mock('@/hooks/auth/useApiClient', () => ({
  useApiClient: () => ({ get: unstable ? (...a: unknown[]) => get(...a) : get }),
}));
jest.mock('@/hooks/utilities/useLocalStorage', () => ({
  useLocalStorage: () => ({ get: getCache, setWithTTL, removeByPrefix }),
}));
jest.mock('react-toastify', () => ({ toast: { error: jest.fn() } }));
jest.mock('@/utils/scrollLock', () => ({ lockScroll: jest.fn(), unlockScroll: jest.fn() }));

const json = (data: unknown, ok = true) => ({ ok, json: async () => data });
const opts = { enableReviews: false, enableLists: false, enableRestaurants: false };

beforeEach(() => {
  jest.clearAllMocks();
  unstable = false;
  getCache.mockReturnValue(null);
});

describe('useUserData: estado inicial', () => {
  it('com userId e autoFetch, nenhum render tem loading false sem perfil nem erro (sem flash)', () => {
    get.mockReturnValue(new Promise(() => {}));
    const renders: Array<{ loading: boolean; profile: unknown; error: string | null }> = [];
    renderHook(() => {
      const r = useUserData({ userId: 'u-pend', ...opts });
      renders.push({ loading: r.loading, profile: r.profile, error: r.error });
      return r;
    });
    expect(renders[0].loading).toBe(true);
    expect(renders.filter(r => !r.loading && !r.profile && !r.error)).toHaveLength(0);
  });

  it('com autoFetch false não fica em loading', () => {
    const { result } = renderHook(() => useUserData({ userId: 'u-off', autoFetch: false, ...opts }));
    expect(result.current.loading).toBe(false);
  });

  it('sem userId não fica em loading', () => {
    const { result } = renderHook(() => useUserData({ userId: '', ...opts }));
    expect(result.current.loading).toBe(false);
  });

  it('perfil existente: carrega e termina sem erro', async () => {
    get.mockResolvedValue(json({ id: 'u-ok', name: 'Ana', accessLevel: 'PUBLIC' }));
    const { result } = renderHook(() => useUserData({ userId: 'u-ok', ...opts }));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.profile?.name).toBe('Ana');
    expect(result.current.error).toBeNull();
  });

  it('perfil inexistente (404): termina com profile null e erro', async () => {
    get.mockResolvedValue(json({ error: 'Utilizador não encontrado' }, false));
    const { result } = renderHook(() => useUserData({ userId: 'u-404', ...opts }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBe('Utilizador não encontrado');
  });

  it('erro de rede: termina com mensagem de erro', async () => {
    get.mockRejectedValue(new Error('Network down'));
    const { result } = renderHook(() => useUserData({ userId: 'u-net', ...opts }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBe('Network down');
  });
});

describe('useUserData: restaurantes antes do perfil', () => {
  it('restaurantes a responder primeiro não termina o loading nem mostra "não encontrado"', async () => {
    let resolveProfile: (v: unknown) => void = () => {};
    get.mockImplementation((url: string) =>
      url.includes('/restaurants')
        ? Promise.resolve(json({ data: [{ id: 'r1' }] }))
        : new Promise(res => { resolveProfile = res; })
    );
    const renders: Array<{ loading: boolean; profile: unknown; error: string | null }> = [];
    const { result } = renderHook(() => {
      const r = useUserData({ userId: 'u-race', enableReviews: false, enableLists: false, enableRestaurants: true });
      renders.push({ loading: r.loading, profile: r.profile, error: r.error });
      return r;
    });
    await waitFor(() => expect(result.current.restaurants).toHaveLength(1));
    expect(result.current.loading).toBe(true);
    resolveProfile(json({ id: 'u-race', name: 'Ana', accessLevel: 'PUBLIC' }));
    await waitFor(() => expect(result.current.profile?.name).toBe('Ana'));
    expect(renders.filter(r => !r.loading && !r.profile && !r.error)).toHaveLength(0);
  });
});

describe('useUserData: pedidos duplicados', () => {
  it('opções inline e re-render: 1 pedido por endpoint', async () => {
    get.mockImplementation(() => Promise.resolve(json({ id: 'u-dup', data: [], accessLevel: 'PUBLIC' })));
    unstable = true;
    const { result, rerender } = renderHook(() =>
      useUserData({ userId: 'u-dup', enableReviews: true, enableLists: true, enableRestaurants: true })
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    rerender();
    rerender();
    await new Promise(r => setTimeout(r, 20));
    const count = (s: string) => get.mock.calls.filter(([u]) => String(u).includes(s)).length;
    expect(count('/api/users/u-dup/reviews')).toBe(1);
    expect(count('/api/users/u-dup/lists')).toBe(1);
    expect(count('/api/users/u-dup/restaurants')).toBe(1);
    expect(get.mock.calls.filter(([u]) => u === '/api/users/u-dup')).toHaveLength(1);
  });
});
