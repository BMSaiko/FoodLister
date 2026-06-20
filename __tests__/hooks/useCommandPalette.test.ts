import { renderHook, act } from '@testing-library/react';
import { useCommandPalette } from '@/hooks/useCommandPalette';

describe('useCommandPalette', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with closed state', () => {
    const { result } = renderHook(() => useCommandPalette());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.activeIndex).toBe(-1);
    expect(result.current.loading).toBe(false);
  });

  it('opens the palette', () => {
    const { result } = renderHook(() => useCommandPalette());

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('closes the palette and resets state', () => {
    const { result } = renderHook(() => useCommandPalette());

    act(() => {
      result.current.open();
    });

    act(() => {
      result.current.setQuery('test');
    });

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.activeIndex).toBe(-1);
  });

  it('toggles the palette state', () => {
    const { result } = renderHook(() => useCommandPalette());

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('sets query', () => {
    const { result } = renderHook(() => useCommandPalette());

    act(() => {
      result.current.setQuery('search term');
    });

    expect(result.current.query).toBe('search term');
  });

  it('sets active index', () => {
    const { result } = renderHook(() => useCommandPalette());

    act(() => {
      result.current.setActiveIndex(2);
    });

    expect(result.current.activeIndex).toBe(2);
  });

  it('navigates to next result', () => {
    const { result } = renderHook(() => useCommandPalette());

    // Set results and starting index
    act(() => {
      result.current.setResults([
        { id: '1', type: 'restaurant', title: 'Test 1' },
        { id: '2', type: 'restaurant', title: 'Test 2' },
        { id: '3', type: 'restaurant', title: 'Test 3' },
      ]);
    });

    act(() => {
      result.current.setActiveIndex(0);
    });

    act(() => {
      result.current.nextResult();
    });
    expect(result.current.activeIndex).toBe(1);

    act(() => {
      result.current.nextResult();
    });
    expect(result.current.activeIndex).toBe(2);
  });

  it('wraps around when navigating next past last result', () => {
    const { result } = renderHook(() => useCommandPalette());

    act(() => {
      result.current.setResults([
        { id: '1', type: 'restaurant', title: 'Test 1' },
        { id: '2', type: 'restaurant', title: 'Test 2' },
      ]);
    });

    act(() => {
      result.current.setActiveIndex(1);
    });

    act(() => {
      result.current.nextResult();
    });
    expect(result.current.activeIndex).toBe(0);
  });

  it('navigates to previous result', () => {
    const { result } = renderHook(() => useCommandPalette());

    act(() => {
      result.current.setResults([
        { id: '1', type: 'restaurant', title: 'Test 1' },
        { id: '2', type: 'restaurant', title: 'Test 2' },
        { id: '3', type: 'restaurant', title: 'Test 3' },
      ]);
    });

    act(() => {
      result.current.setActiveIndex(2);
    });

    act(() => {
      result.current.prevResult();
    });
    expect(result.current.activeIndex).toBe(1);

    act(() => {
      result.current.prevResult();
    });
    expect(result.current.activeIndex).toBe(0);
  });

  it('wraps around when navigating previous past first result', () => {
    const { result } = renderHook(() => useCommandPalette());

    act(() => {
      result.current.setResults([
        { id: '1', type: 'restaurant', title: 'Test 1' },
        { id: '2', type: 'restaurant', title: 'Test 2' },
      ]);
    });

    act(() => {
      result.current.setActiveIndex(0);
    });

    act(() => {
      result.current.prevResult();
    });
    expect(result.current.activeIndex).toBe(1);
  });

  it('selects current result', () => {
    const { result } = renderHook(() => useCommandPalette());

    const mockResults = [
      { id: '1', type: 'restaurant', title: 'Test 1' },
      { id: '2', type: 'list', title: 'Test 2' },
    ];

    act(() => {
      result.current.setResults(mockResults);
    });

    act(() => {
      result.current.setActiveIndex(1);
    });

    let selected: any = null;
    act(() => {
      selected = result.current.selectCurrent();
    });

    expect(selected).toEqual(mockResults[1]);
  });

  it('returns null when no active result', () => {
    const { result } = renderHook(() => useCommandPalette());

    let selected: any = 'initial';
    act(() => {
      selected = result.current.selectCurrent();
    });

    expect(selected).toBeNull();
  });

  it('sets loading state', () => {
    const { result } = renderHook(() => useCommandPalette());

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.loading).toBe(true);
  });

  it('sets results', () => {
    const { result } = renderHook(() => useCommandPalette());

    const newResults = [
      { id: '1', type: 'restaurant', title: 'Found Restaurant' },
      { id: '2', type: 'list', title: 'Found List' },
    ];

    act(() => {
      result.current.setResults(newResults);
    });

    expect(result.current.results).toEqual(newResults);
  });

  it('provides an inputRef', () => {
    const { result } = renderHook(() => useCommandPalette());

    expect(result.current.inputRef).toBeDefined();
    expect(result.current.inputRef.current).toBe(null);
  });
});
