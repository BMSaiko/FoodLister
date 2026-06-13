import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebouncedCallback } from '@/hooks/utilities/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial'); // Still old value

    act(() => { jest.advanceTimersByTime(500); });
    expect(result.current).toBe('updated'); // Now debounced value
  });

  it('cancels previous timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    );

    rerender({ value: 'b', delay: 300 });
    rerender({ value: 'c', delay: 300 });

    act(() => { jest.advanceTimersByTime(300); });
    expect(result.current).toBe('c'); // Only last value
  });

  it('works with numbers', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 100 } }
    );

    rerender({ value: 42, delay: 100 });
    act(() => { jest.advanceTimersByTime(100); });
    expect(result.current).toBe(42);
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('delays callback invocation', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    result.current('arg1');

    expect(callback).not.toHaveBeenCalled();

    act(() => { jest.advanceTimersByTime(500); });
    expect(callback).toHaveBeenCalledWith('arg1');
  });

  it('cancels previous call on rapid invocations', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    result.current('first');
    result.current('second');

    act(() => { jest.advanceTimersByTime(300); });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('second');
  });
});

