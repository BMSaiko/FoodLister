'use client';

import React, { useState, useEffect } from 'react';
import { Search, Calendar, X, Utensils, Filter } from 'lucide-react';

interface MealSearchBarProps {
  onSearch: (filters: MealFilters) => void;
  onClear: () => void;
  activeFiltersCount: number;
}

export interface MealFilters {
  searchQuery: string;
  dateFrom: string;
  dateTo: string;
  mealType: string;
}

const MEAL_TYPES = [
  { value: '', label: 'Todos os tipos' },
  { value: 'pequeno-almoco', label: '☕ Pequeno Almoço' },
  { value: 'almoco', label: '🍽️ Almoço' },
  { value: 'brunch', label: '🥐 Brunch' },
  { value: 'lanche', label: '🍪 Lanche' },
  { value: 'jantar', label: '🍽️ Jantar' },
  { value: 'ceia', label: '🌙 Ceia' }
];

export default function MealSearchBar({ onSearch, onClear, activeFiltersCount }: MealSearchBarProps) {
  const [filters, setFilters] = useState<MealFilters>({
    searchQuery: '',
    dateFrom: '',
    dateTo: '',
    mealType: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.searchQuery]);

  const handleInputChange = (field: keyof MealFilters, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    
    // Apply immediately for non-text fields
    if (field !== 'searchQuery') {
      onSearch(newFilters);
    }
  };

  const handleClearAll = () => {
    const clearedFilters: MealFilters = {
      searchQuery: '',
      dateFrom: '',
      dateTo: '',
      mealType: ''
    };
    setFilters(clearedFilters);
    onClear();
  };

  const hasActiveFilters = filters.searchQuery || filters.dateFrom || filters.dateTo || filters.mealType;

  return (
    <div className="space-y-3">
      {/* Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar por restaurante..."
            value={filters.searchQuery}
            onChange={(e) => handleInputChange('searchQuery', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-gray-400"
          />
          {filters.searchQuery && (
            <button
              onClick={() => handleInputChange('searchQuery', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-100"
            >
              <X className="h-3.5 w-3.5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-white text-amber-600 rounded-full text-xs font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Extended Filters */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date From */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Data início
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleInputChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Date To */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Data fim
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleInputChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Meal Type Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
              <Utensils className="h-3.5 w-3.5" />
              Tipo de refeição
            </label>
            <select
              value={filters.mealType}
              onChange={(e) => handleInputChange('mealType', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              {MEAL_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Button */}
          {hasActiveFilters && (
            <div className="flex justify-end pt-2 border-t border-gray-200">
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              Restaurante: {filters.searchQuery}
              <button
                onClick={() => handleInputChange('searchQuery', '')}
                className="p-0.5 rounded-full hover:bg-amber-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.dateFrom && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Desde: {new Date(filters.dateFrom).toLocaleDateString('pt-PT')}
              <button
                onClick={() => handleInputChange('dateFrom', '')}
                className="p-0.5 rounded-full hover:bg-blue-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.dateTo && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Até: {new Date(filters.dateTo).toLocaleDateString('pt-PT')}
              <button
                onClick={() => handleInputChange('dateTo', '')}
                className="p-0.5 rounded-full hover:bg-blue-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.mealType && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {MEAL_TYPES.find(t => t.value === filters.mealType)?.label}
              <button
                onClick={() => handleInputChange('mealType', '')}
                className="p-0.5 rounded-full hover:bg-green-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}