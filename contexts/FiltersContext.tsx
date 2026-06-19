'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FiltersContextValue {
  clearTrigger: number;
  clearFilters: () => void;
}

const FiltersContext = createContext<FiltersContextValue | null>(null);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [clearTrigger, setClearTrigger] = useState(0);

  const clearFilters = () => {
    setClearTrigger(prev => prev + 1);
  };

  return (
    <FiltersContext.Provider value={{ clearTrigger, clearFilters }}>
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error('useFilters must be used within a FiltersProvider');
  }
  return context;
}