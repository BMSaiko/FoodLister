import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

interface UseVirtualScrollOptions {
  itemCount: number;
  itemHeight: number;
  overscan?: number;
  containerHeight?: number;
}

interface UseVirtualScrollReturn {
  virtualItems: { index: number; style: React.CSSProperties }[];
  totalHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
}

export function useVirtualScroll({
  itemCount,
  itemHeight,
  overscan = 5,
  containerHeight = 600,
}: UseVirtualScrollOptions): UseVirtualScrollReturn {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { virtualItems, totalHeight } = useMemo(() => {
    const totalHeight = itemCount * itemHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(itemCount - 1, startIndex + visibleCount + overscan * 2);

    const items: { index: number; style: React.CSSProperties }[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      items.push({
        index: i,
        style: {
          position: 'absolute',
          top: i * itemHeight,
          height: itemHeight,
          left: 0,
          right: 0,
        },
      });
    }

    return { virtualItems: items, totalHeight };
  }, [itemCount, itemHeight, scrollTop, overscan, containerHeight]);

  const onScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', onScroll, { passive: true });
      return () => container.removeEventListener('scroll', onScroll);
    }
  }, [onScroll]);

  return { virtualItems, totalHeight, containerRef, onScroll };
}

