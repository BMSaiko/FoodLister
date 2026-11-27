import { renderHook, act, waitFor } from '@testing-library/react';
import useUnseenRelease, { SEEN_KEY } from '@/hooks/releases/useUnseenRelease';

let latest: { version: string; title: string } | null = null;
let failFetch = false;
const maybeSingle = jest.fn(async () => {
  if (failFetch) throw new Error('rede');
  return { data: latest, error: null };
});
let mockUser: { id: string } | null = null;
jest.mock('@/hooks/auth/useAuthUser', () => ({
  useAuthUser: () => ({ user: mockUser, loading: false, isValidating: false }),
}));

let notificationRow: { read: boolean } | null = null;
const updateSpy = jest.fn();
const eqCalls: Array<[string, unknown]> = [];
const notificationTables: string[] = [];
const selChain: Record<string, unknown> = {};
selChain.eq = () => selChain;
selChain.maybeSingle = async () => ({ data: notificationRow, error: null });
const updChain: Record<string, unknown> = {};
updChain.eq = (col: string, val: unknown) => {
  eqCalls.push([col, val]);
  return updChain;
};
updChain.then = (res: (v: { error: null }) => unknown) => res({ error: null });

jest.mock('@/libs/supabase/client', () => ({
  getClient: () => ({
    from: (table: string) => {
      if (table === 'release_notes') {
        return { select: () => ({ order: () => ({ limit: () => ({ maybeSingle }) }) }) };
      }
      notificationTables.push(table);
      return {
        select: () => selChain,
        update: (payload: unknown) => {
          updateSpy(payload);
          return updChain;
        },
      };
    },
  }),
}));

describe('useUnseenRelease', () => {
  beforeEach(() => {
    localStorage.clear();
    latest = null;
    failFetch = false;
    jest.restoreAllMocks();
    mockUser = null;
    notificationRow = null;
    updateSpy.mockClear();
    eqCalls.length = 0;
    notificationTables.length = 0;
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

  describe('autenticado (estado na BD)', () => {
    beforeEach(() => {
      mockUser = { id: 'u1' };
      latest = { version: '1.2.0', title: 'Versão 1.2.0' };
    });

    it('notificação já lida na BD conta como vista noutro dispositivo', async () => {
      notificationRow = { read: true };
      const { result } = renderHook(() => useUnseenRelease());
      await waitFor(() => expect(result.current.loading).toBe(false));
      await waitFor(() => expect(result.current.release).toBeNull());
    });

    it('notificação por ler mantém a release como não vista', async () => {
      notificationRow = { read: false };
      const { result } = renderHook(() => useUnseenRelease());
      await waitFor(() => expect(result.current.release?.version).toBe('1.2.0'));
    });

    it('markSeen marca a notificação da versão como lida na BD', async () => {
      const { result } = renderHook(() => useUnseenRelease());
      await waitFor(() => expect(result.current.release).not.toBeNull());
      await act(async () => result.current.markSeen('1.2.0'));
      expect(updateSpy).toHaveBeenCalledWith({ read: true });
      expect(eqCalls).toEqual(
        expect.arrayContaining([['user_id', 'u1'], ['type', 'release'], ['link', '/novidades/1.2.0']]),
      );
    });

    it('falha no UPDATE não rebenta e a release fica vista localmente', async () => {
      updChain.then = (_res: unknown, rej: (e: Error) => unknown) => rej(new Error('403'));
      const { result } = renderHook(() => useUnseenRelease());
      await waitFor(() => expect(result.current.release).not.toBeNull());
      await act(async () => result.current.markSeen('1.2.0'));
      expect(result.current.release).toBeNull();
      updChain.then = (res: (v: { error: null }) => unknown) => res({ error: null });
    });
  });

  it('anónimo nunca consulta notificações', async () => {
    latest = { version: '1.2.0', title: 'Versão 1.2.0' };
    const { result } = renderHook(() => useUnseenRelease());
    await waitFor(() => expect(result.current.release).not.toBeNull());
    await act(async () => result.current.markSeen('1.2.0'));
    expect(notificationTables).toEqual([]);
    expect(updateSpy).not.toHaveBeenCalled();
  });
});
