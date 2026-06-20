'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export interface CommandResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
}

export interface CommandPaletteState {
  isOpen: boolean;
  query: string;
  results: CommandResult[];
  activeIndex: number;
  loading: boolean;
}

export interface CommandPaletteActions {
  open: () => void;
  close: () => void;
  toggle: () => void;
  setQuery: (query: string) => void;
  setActiveIndex: (index: number) => void;
  nextResult: () => void;
  prevResult: () => void;
  selectCurrent: () => CommandResult | null;
}

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CommandResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Open palette
  const open = useCallback(() => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // Close palette
  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setActiveIndex(-1);
  }, []);

  // Toggle palette
  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  // Navigate to next result
  const nextResult = useCallback(() => {
    setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
  }, [results.length]);

  // Navigate to previous result
  const prevResult = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
  }, [results.length]);

  // Get current selected result
  const selectCurrent = useCallback((): CommandResult | null => {
    if (activeIndex >= 0 && activeIndex < results.length) {
      return results[activeIndex];
    }
    return null;
  }, [activeIndex, results]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(results.length > 0 ? 0 : -1);
  }, [results]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setActiveIndex(-1);
      setLoading(false);
    }
  }, [isOpen]);

  // Global Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle]);

  const state: CommandPaletteState = {
    isOpen,
    query,
    results,
    activeIndex,
    loading,
  };

  const actions: CommandPaletteActions = {
    open,
    close,
    toggle,
    setQuery,
    setActiveIndex,
    nextResult,
    prevResult,
    selectCurrent,
  };

  return {
    ...state,
    ...actions,
    inputRef,
    setResults,
    setLoading,
  };
}
