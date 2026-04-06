"use client";

import React, { useState, useCallback } from 'react';
import { Filter, X, Search, Star, ArrowUpDown } from 'lucide-react';

interface ListFiltersProps {
  onFilterChange: (filters: ListFilters) => void;
  onSortChange: (sort: SortOption) => void;
  onClearFilters: () => void;
  tags?: string[];
  initialFilters?: ListFilters;
  initialSort?: SortOption;
}

export interface ListFilters {
  search: string;
  tag: string;
  minRating: number;
  isPublic: boolean | null;
}

export interface SortOption {
  field: 'name' | 'createdAt' | 'restaurantCount' | 'rating';
  direction: 'asc' | 'desc';
}

const defaultFilters: ListFilters = {
  search: '',
  tag: '',
  minRating: 0,
  isPublic: null,
};

const defaultSort: SortOption = {
  field: 'createdAt',
  direction: 'desc',
};

export default function ListFilters({ 
  onFilterChange, 
  onSortChange, 
  onClearFilters, 
  tags = [],
  initialFilters,
  initialSort 
}: ListFiltersProps) {
  const [filters, setFilters] = useState<ListFilters>(initialFilters || defaultFilters);
  const [sort, setSort] = useState<SortOption>(initialSort || defaultSort);
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = useCallback((key: keyof ListFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const updateSort = useCallback((field: SortOption['field']) => {
    const newSort: SortOption = {
      field,
      direction: sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc',
    };
    setSort(newSort);
    onSortChange(newSort);
  }, [sort, onSortChange]);

  const clearAll = useCallback(() => {
    setFilters(defaultFilters);
    setSort(defaultSort);
    onClearFilters();
  }, [onClearFilters]);

  const hasActiveFilters = filters.search || filters.tag || filters.minRating > 0 || filters.isPublic !== null;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Pesquisar listas..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
            showFilters || hasActiveFilters 
              ? 'border-amber-500 bg-amber-50 text-amber-700' 
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filtros</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-amber-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateFilter('tag', '')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    !filters.tag 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todas
                </button>
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => updateFilter('tag', tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.tag === tag 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Minimum Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating Mínimo: {filters.minRating > 0 ? `${filters.minRating}★` : 'Qualquer'}
            </label>
            <div className="flex gap-2">
              {[0, 3, 3.5, 4, 4.5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => updateFilter('minRating', rating)}
                  className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-colors ${
                    filters.minRating === rating 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {rating > 0 ? `${rating}★` : 'Qualquer'}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Privacidade</label>
            <div className="flex gap-2">
              <button
                onClick={() => updateFilter('isPublic', null)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filters.isPublic === null 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => updateFilter('isPublic', true)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filters.isPublic === true 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Públicas
              </button>
              <button
                onClick={() => updateFilter('isPublic', false)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filters.isPublic === false 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Privadas
              </button>
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              Ordenar por
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { field: 'createdAt' as const, label: 'Data' },
                { field: 'name' as const, label: 'Nome' },
                { field: 'restaurantCount' as const, label: 'Restaurantes' },
              ].map(({ field, label }) => (
                <button
                  key={field}
                  onClick={() => updateSort(field)}
                  className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-colors ${
                    sort.field === field 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                  {sort.field === field && (
                    <span className="text-xs">{sort.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Button */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="h-3 w-3" />
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}