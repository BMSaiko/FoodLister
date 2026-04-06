'use client';

import { useState, useCallback, useMemo } from 'react';

interface List {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  [key: string]: any;
}

export interface UseListTagFilterReturn {
  filteredLists: List[];
  selectedTags: string[];
  allTags: string[];
  selectTag: (tag: string) => void;
  deselectTag: (tag: string) => void;
  toggleTag: (tag: string) => void;
  clearTags: () => void;
  hasActiveFilters: boolean;
}

export function filterListsByTags(
  lists: List[],
  selectedTags: string[]
): List[] {
  if (!selectedTags || selectedTags.length === 0) {
    return lists;
  }

  return lists.filter((list) => {
    const listTags = list.tags || [];
    return listTags.some((tag) => selectedTags.includes(tag));
  });
}

export function getAllUniqueTags(lists: List[]): string[] {
  const tagsSet = new Set<string>();

  lists.forEach((list) => {
    const listTags = list.tags || [];
    listTags.forEach((tag) => tagsSet.add(tag));
  });

  return Array.from(tagsSet).sort();
}

export function useListTagFilter(lists: List[]): UseListTagFilterReturn {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = useMemo(() => getAllUniqueTags(lists), [lists]);

  const filteredLists = useMemo(
    () => filterListsByTags(lists, selectedTags),
    [lists, selectedTags]
  );

  const selectTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev : [...prev, tag]
    );
  }, []);

  const deselectTag = useCallback((tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const toggleTag = useCallback(
    (tag: string) => {
      setSelectedTags((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
      );
    },
    []
  );

  const clearTags = useCallback(() => {
    setSelectedTags([]);
  }, []);

  const hasActiveFilters = selectedTags.length > 0;

  return {
    filteredLists,
    selectedTags,
    allTags,
    selectTag,
    deselectTag,
    toggleTag,
    clearTags,
    hasActiveFilters,
  };
}