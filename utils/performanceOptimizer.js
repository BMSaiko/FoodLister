// Performance optimization utilities for roulette filter system
'use client';

import { useCallback, useMemo, useRef, useEffect } from 'react';

/**
 * Performance optimization utilities for the roulette filter system
 */
export class PerformanceOptimizer {
  /**
   * Debounce utility for expensive operations
   */
  static debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  /**
   * Throttle utility for high-frequency operations
   */
  static throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  /**
   * Memoize expensive calculations
   */
  static memoize = (fn) => {
    const cache = new Map();
    return function(...args) {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn.apply(this, args);
      cache.set(key, result);
      return result;
    };
  };

  /**
   * Virtualization for long lists
   */
  static useVirtualization(items, itemHeight, containerHeight) {
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
    
    const handleScroll = useCallback((scrollTop) => {
      const start = Math.floor(scrollTop / itemHeight);
      const visibleCount = Math.ceil(containerHeight / itemHeight);
      const end = start + visibleCount + 2; // Buffer for smooth scrolling
      
      setVisibleRange({ start, end });
    }, [itemHeight, containerHeight]);

    const visibleItems = useMemo(() => {
      return items.slice(visibleRange.start, visibleRange.end);
    }, [items, visibleRange]);

    return {
      visibleItems,
      handleScroll,
      totalHeight: items.length * itemHeight,
      startIndex: visibleRange.start
    };
  }

  /**
   * Lazy loading for images
   */
  static useLazyImage(src, options = {}) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef();

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1, ...options }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    }, [options]);

    useEffect(() => {
      if (isInView) {
        const img = new Image();
        img.src = src;
        img.onload = () => setIsLoaded(true);
      }
    }, [src, isInView]);

    return { imgRef, isLoaded };
  }

  /**
   * Memory management for large datasets
   */
  static useMemoryManagement(data, maxSize = 1000) {
    const [processedData, setProcessedData] = useState([]);
    const dataRef = useRef([]);

    useEffect(() => {
      // Process data in chunks to prevent blocking
      const processChunk = (chunk, index) => {
        setTimeout(() => {
          setProcessedData(prev => [...prev, ...chunk]);
          dataRef.current = [...dataRef.current, ...chunk];
          
          // Cleanup old data if exceeding max size
          if (dataRef.current.length > maxSize) {
            const toRemove = dataRef.current.length - maxSize;
            dataRef.current = dataRef.current.slice(toRemove);
            setProcessedData(prev => prev.slice(toRemove));
          }
        }, 0);
      };

      // Process data in chunks of 100
      const chunkSize = 100;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        processChunk(chunk, i);
      }
    }, [data, maxSize]);

    return processedData;
  }

  /**
   * Animation performance optimization
   */
  static useSmoothAnimation(initialValue, targetValue, duration = 300) {
    const [value, setValue] = useState(initialValue);
    const startTime = useRef(null);
    const animationFrame = useRef(null);

    const animate = useCallback((timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      
      const progress = (timestamp - startTime.current) / duration;
      const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      
      if (progress < 1) {
        const currentValue = initialValue + (targetValue - initialValue) * easedProgress;
        setValue(currentValue);
        animationFrame.current = requestAnimationFrame(animate);
      } else {
        setValue(targetValue);
      }
    }, [initialValue, targetValue, duration]);

    useEffect(() => {
      if (targetValue !== initialValue) {
        startTime.current = null;
        animationFrame.current = requestAnimationFrame(animate);
      }
      
      return () => {
        if (animationFrame.current) {
          cancelAnimationFrame(animationFrame.current);
        }
      };
    }, [targetValue, animate]);

    return value;
  }

  /**
   * Filter performance optimization
   */
  static useOptimizedFilters(restaurants, filters) {
    return useMemo(() => {
      if (!restaurants || restaurants.length === 0) return [];
      
      // Early exit for no filters
      if (!filters || Object.keys(filters).length === 0) {
        return restaurants;
      }

      // Apply filters with performance optimizations
      let filtered = restaurants;

      // Location filter (most selective first)
      if (filters.location?.city) {
        filtered = filtered.filter(r => 
          r.location?.city?.toLowerCase() === filters.location.city.toLowerCase()
        );
      }

      // Price range filter
      if (filters.price_range) {
        filtered = filtered.filter(r => {
          const price = r.price_range || 0;
          return price >= filters.price_range.min && price <= filters.price_range.max;
        });
      }

      // Rating filter
      if (filters.rating_range) {
        filtered = filtered.filter(r => {
          const rating = r.rating || 0;
          return rating >= filters.rating_range.min && rating <= filters.rating_range.max;
        });
      }

      // Cuisine types filter
      if (filters.cuisine_types && filters.cuisine_types.length > 0) {
        filtered = filtered.filter(r => {
          const restaurantCuisines = r.cuisine_types?.map(ct => ct.id) || [];
          return filters.cuisine_types.some(ct => restaurantCuisines.includes(ct));
        });
      }

      // Features filter
      if (filters.features && filters.features.length > 0) {
        filtered = filtered.filter(r => {
          const restaurantFeatures = r.features?.map(f => f.id) || [];
          return filters.features.every(f => restaurantFeatures.includes(f));
        });
      }

      // Dietary options filter
      if (filters.dietary_options && filters.dietary_options.length > 0) {
        filtered = filtered.filter(r => {
          const restaurantDietary = r.dietary_options?.map(d => d.id) || [];
          return filters.dietary_options.every(d => restaurantDietary.includes(d));
        });
      }

      return filtered;
    }, [restaurants, filters]);
  }

  /**
   * SVG rendering optimization
   */
  static useOptimizedSVG(width, height, data) {
    const svgRef = useRef();
    
    useEffect(() => {
      if (!svgRef.current || !data) return;

      const svg = d3.select(svgRef.current);
      
      // Use requestAnimationFrame for smooth updates
      const updateChart = () => {
        // Update logic here
        // Use data joins and transitions for performance
      };

      requestAnimationFrame(updateChart);
    }, [data]);

    return svgRef;
  }

  /**
   * Search performance optimization
   */
  static useOptimizedSearch(items, searchQuery, searchFields = ['name']) {
    const [searchResults, setSearchResults] = useState([]);
    const searchTimeout = useRef();

    const performSearch = useCallback((query) => {
      if (!query || query.trim().length < 2) {
        setSearchResults(items);
        return;
      }

      const normalizedQuery = query.toLowerCase().trim();
      
      // Use Web Worker for heavy search operations
      if (items.length > 1000) {
        const worker = new Worker('/workers/search-worker.js');
        worker.postMessage({ items, query: normalizedQuery, fields: searchFields });
        
        worker.onmessage = (e) => {
          setSearchResults(e.data.results);
          worker.terminate();
        };
      } else {
        // Inline search for smaller datasets
        const results = items.filter(item => 
          searchFields.some(field => 
            item[field]?.toLowerCase().includes(normalizedQuery)
          )
        );
        setSearchResults(results);
      }
    }, [items, searchFields]);

    const debouncedSearch = useMemo(
      () => this.debounce(performSearch, 300),
      [performSearch]
    );

    useEffect(() => {
      debouncedSearch(searchQuery);
      
      return () => {
        if (searchTimeout.current) {
          clearTimeout(searchTimeout.current);
        }
      };
    }, [searchQuery, debouncedSearch]);

    return searchResults;
  }

  /**
   * State management optimization
   */
  static useOptimizedState(initialState) {
    const [state, setState] = useState(initialState);
    const stateRef = useRef(state);

    const setOptimizedState = useCallback((newState) => {
      // Deep comparison to prevent unnecessary re-renders
      const newStateStr = JSON.stringify(newState);
      const currentStateStr = JSON.stringify(stateRef.current);
      
      if (newStateStr !== currentStateStr) {
        stateRef.current = newState;
        setState(newState);
      }
    }, []);

    return [state, setOptimizedState];
  }

  /**
   * Event listener optimization
   */
  static useOptimizedEventListener(element, eventType, handler, options = {}) {
    const handlerRef = useRef(handler);
    
    useEffect(() => {
      handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
      if (!element) return;

      const optimizedHandler = (...args) => handlerRef.current(...args);
      
      element.addEventListener(eventType, optimizedHandler, options);
      
      return () => {
        element.removeEventListener(eventType, optimizedHandler, options);
      };
    }, [element, eventType, options]);
  }

  /**
   * Resize observer optimization
   */
  static useOptimizedResizeObserver(element, callback, debounceTime = 100) {
    const callbackRef = useRef(callback);
    
    useEffect(() => {
      callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
      if (!element) return;

      const debouncedCallback = this.debounce(callbackRef.current, debounceTime);
      const resizeObserver = new ResizeObserver(debouncedCallback);
      
      resizeObserver.observe(element);
      
      return () => {
        resizeObserver.disconnect();
      };
    }, [element, debounceTime]);
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  static measureRenderTime(componentName, renderFunction) {
    const startTime = performance.now();
    const result = renderFunction();
    const endTime = performance.now();
    
    console.log(`${componentName} render time: ${(endTime - startTime).toFixed(2)}ms`);
    return result;
  }

  static measureMemoryUsage(label) {
    if (performance.memory) {
      console.log(`${label} - Memory Usage:`, {
        used: `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      });
    }
  }

  static measureFilterPerformance(filterFunction, data, iterations = 100) {
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      filterFunction(data);
    }
    
    const endTime = performance.now();
    const avgTime = (endTime - startTime) / iterations;
    
    console.log(`Average filter time: ${avgTime.toFixed(2)}ms`);
    return avgTime;
  }

  static trackFPS() {
    let lastTime = performance.now();
    let frames = 0;

    const measureFPS = (currentTime) => {
      frames++;
      if (currentTime - lastTime >= 1000) {
        console.log(`FPS: ${frames}`);
        frames = 0;
        lastTime = currentTime;
      }
      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }
}

/**
 * Performance configuration
 */
export const PERFORMANCE_CONFIG = {
  // Debounce timeouts
  DEBOUNCE_TIMES: {
    SEARCH: 300,
    FILTERS: 150,
    RESIZE: 250
  },

  // Throttle limits
  THROTTLE_LIMITS: {
    SCROLL: 16, // ~60fps
    RESIZE: 100,
    MOUSE_MOVE: 16
  },

  // Virtualization settings
  VIRTUALIZATION: {
    ITEM_HEIGHT: 60,
    BUFFER_SIZE: 5,
    CONTAINER_HEIGHT: 400
  },

  // Memory management
  MEMORY: {
    MAX_ITEMS: 1000,
    CHUNK_SIZE: 100,
    CLEANUP_THRESHOLD: 500
  },

  // Animation settings
  ANIMATION: {
    DURATION: 300,
    EASING: 'ease-out'
  }
};

export default PerformanceOptimizer;