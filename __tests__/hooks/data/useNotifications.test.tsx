import { renderHook, act } from '@testing-library/react';
import { useNotifications } from '@/hooks/data/useNotifications';

jest.mock('@/hooks/auth/useAuthUser', () => {
  const value = { user: { id: 'u1' } };
  return { useAuthUser: () => value };
});

function setHidden(hidden: boolean) {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
}

describe('useNotifications polling', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    fetchMock = jest.fn(async () => ({
      ok: true,
      json: async () => ({ data: [], unreadCount: 0 }),
    }));
    (global as any).fetch = fetchMock;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const flush = async (ms: number) => {
    await act(async () => {
      let left = ms;
      do {
        const step = Math.min(left, 1000);
        jest.advanceTimersByTime(step);
        left -= step;
        for (let i = 0; i < 5; i++) await Promise.resolve();
      } while (left > 0);
    });
  };

  it('não faz polling com polling=false', async () => {
    renderHook(() => useNotifications({ polling: false }));
    await flush(0);
    await flush(600000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('com a aba oculta não faz pedidos', async () => {
    renderHook(() => useNotifications());
    await flush(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    setHidden(true);
    await flush(600000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('volta a pedir ao ficar visível', async () => {
    renderHook(() => useNotifications());
    await flush(0);
    setHidden(true);
    await flush(60000);
    setHidden(false);
    await flush(0);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('back-off: sem novidades os pedidos espaçam-se', async () => {
    renderHook(() => useNotifications());
    await flush(0);
    await flush(30000); // 2.º
    await flush(60000); // 3.º
    await flush(120000); // 4.º
    expect(fetchMock).toHaveBeenCalledTimes(4);
    await flush(120000); // ainda não (próximo a 240 s)
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('10 min de aba aberta sem novidades: ≤6 pedidos (antes 21)', async () => {
    renderHook(() => useNotifications());
    await flush(0);
    await flush(600000);
    expect(fetchMock.mock.calls.length).toBeLessThanOrEqual(6);
  });
});
