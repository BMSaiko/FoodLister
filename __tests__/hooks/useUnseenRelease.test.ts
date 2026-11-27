import { renderHook, act, waitFor } from '@testing-library/react';
import useUnseenRelease, { SEEN_KEY } from '@/hooks/releases/useUnseenRelease';

let latest: { version: string; title: string } | null = null;
let failFetch = false;
const maybeSingle = jest.fn(async () => {
  if (failFetch) throw new Error('rede');
  return { data: latest, error: null };
});
jest.mock('@/libs/supabase/client', () => ({
  getClient: () => ({
    from: () => ({ select: () => ({ order: () => ({ limit: () => ({ maybeSingle }) }) }) }),
  }),
}));

describe('useUnseenRelease', () => {
  beforeEach(() => {
    localStorage.clear();
    latest = null;
    failFetch = false;
    jest.restoreAllMocks();
  });

  it('sem releases devolve null', async () => {
    const { result } = renderHook(() => useUnseenRelease());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.release).toBeNull();
  });

  it('release nunca vista é devolvida', async () => {
    latest = { version: '1.2.0', title: 'Versão 1.2.0' };
    const { result } = renderHook(() => useUnseenRelease());
    await waitFor(() => expect(result.current.release?.version).toBe('1.2.0'));
  });

  it('release já vista devolve null', async () => {
    latest = { version: '1.2.0', title: 'Versão 1.2.0' };
    localStorage.setItem(SEEN_KEY, '1.2.0');
    const { result } = renderHook(() => useUnseenRelease());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.release).toBeNull();
  });

  it('markSeen grava a versão e limpa a release', async () => {
    latest = { version: '1.2.0', title: 'Versão 1.2.0' };
    const { result } = renderHook(() => useUnseenRelease());
    await waitFor(() => expect(result.current.release).not.toBeNull());
    act(() => result.current.markSeen('1.2.0'));
    expect(localStorage.getItem(SEEN_KEY)).toBe('1.2.0');
    expect(result.current.release).toBeNull();
  });

  it('nova versão depois de uma vista volta a aparecer', async () => {
    latest = { version: '1.3.0', title: 'Versão 1.3.0' };
    localStorage.setItem(SEEN_KEY, '1.2.0');
    const { result } = renderHook(() => useUnseenRelease());
    await waitFor(() => expect(result.current.release?.version).toBe('1.3.0'));
  });

  it('localStorage indisponível não rebenta', async () => {
    latest = { version: '1.2.0', title: 'Versão 1.2.0' };
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('bloqueado'); });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('bloqueado'); });
    const { result } = renderHook(() => useUnseenRelease());
    await waitFor(() => expect(result.current.release?.version).toBe('1.2.0'));
    expect(() => act(() => result.current.markSeen('1.2.0'))).not.toThrow();
    expect(result.current.release).toBeNull();
  });

  it('falha de rede devolve null', async () => {
    failFetch = true;
    const { result } = renderHook(() => useUnseenRelease());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.release).toBeNull();
  });
});
