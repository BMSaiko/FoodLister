import { renderHook } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/utilities/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null for non-existent key', () => {
    const { result } = renderHook(() => useLocalStorage());
    expect(result.current.get('missing')).toBeNull();
  });

  it('sets and gets a value', () => {
    const { result } = renderHook(() => useLocalStorage());
    result.current.set('key1', 'hello');
    expect(result.current.get('key1')).toBe('hello');
  });

  it('sets and gets objects', () => {
    const { result } = renderHook(() => useLocalStorage());
    result.current.set('obj', { name: 'test', count: 5 });
    const val = result.current.get<{ name: string; count: number }>('obj');
    expect(val).toEqual({ name: 'test', count: 5 });
  });

  it('removes a key', () => {
    const { result } = renderHook(() => useLocalStorage());
    result.current.set('key1', 'value');
    result.current.remove('key1');
    expect(result.current.get('key1')).toBeNull();
  });

  it('clears all keys', () => {
    const { result } = renderHook(() => useLocalStorage());
    result.current.set('a', 1);
    result.current.set('b', 2);
    result.current.clear();
    expect(result.current.get('a')).toBeNull();
    expect(result.current.get('b')).toBeNull();
  });

  it('handles TTL - returns value before expiry', () => {
    const { result } = renderHook(() => useLocalStorage());
    result.current.setWithTTL('cached', 'data', 60000); // 60 second TTL
    expect(result.current.get('cached')).toBe('data');
  });

  it('handles TTL - returns null after expiry', () => {
    const { result } = renderHook(() => useLocalStorage());
    // Set with TTL of 0 (already expired)
    result.current.setWithTTL('cached', 'data', 0);
    expect(result.current.get('cached')).toBeNull();
  });

  it('removes keys by prefix', () => {
    const { result } = renderHook(() => useLocalStorage());
    result.current.set('app:user1', 'data1');
    result.current.set('app:user2', 'data2');
    result.current.set('other:key', 'data3');
    result.current.removeByPrefix('app:');
    expect(result.current.get('app:user1')).toBeNull();
    expect(result.current.get('app:user2')).toBeNull();
    expect(result.current.get('other:key')).toBe('data3');
  });

  it('handles invalid JSON gracefully', () => {
    localStorage.setItem('bad', '{invalid json');
    const { result } = renderHook(() => useLocalStorage());
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    expect(result.current.get('bad')).toBeNull();
    consoleSpy.mockRestore();
  });
});

