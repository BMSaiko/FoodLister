/**
 * FilterPanel - Generic filter panel component
 * Provides a collapsible filter container with active filter chips
 */

"use client";

import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterChip {
  id: string;
  label: string;
  onRemove: () => void;
}

interface FilterPanelProps {
  children: React.ReactNode;
  activeFilters: FilterChip[];
  onClearAll?: () => void;
  title?: string;
  defaultOpen?: boolean;
  className?: string;
}

export default function FilterPanel({
  children,
  activeFilters,
  onClearAll,
  title = 'Filtros',
  defaultOpen = false,
  className = ''
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-md">
            <Filter className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <span className="block text-lg font-bold text-gray-800">{title}</span>
            {activeFilters.length > 0 && (
              <span className="text-sm text-amber-600 font-medium">
                {activeFilters.length} {activeFilters.length === 1 ? 'filtro ativo' : 'filtros ativos'}
              </span>
            )}
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {/* Active Filters Chips */}
      {activeFilters.length > 0 && (
        <div className="px-4 sm:px-6 pb-3">
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(filter => (
              <span
                key={filter.id}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200/80 shadow-sm group"
              >
                <span className="mr-2 w-2 h-2 bg-amber-400 rounded-full"></span>
                <span className="font-medium">{filter.label}</span>
                <button
                  onClick={filter.onRemove}
                  className="ml-2 p-0.5 rounded-full hover:bg-amber-200/50 transition-colors"
                  aria-label="Remover filtro"
                >
                  <X className="h-3.5 w-3.5 text-amber-600" />
                </button>
              </span>
            ))}
            {onClearAll && (
              <button
                onClick={onClearAll}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Limpar tudo
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter Content */}
      {isOpen && (
        <div className="p-4 sm:p-6 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * FilterSection - Section wrapper for filter groups
 */
interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function FilterSection({ title, children, className = '' }: FilterSectionProps) {
  return (
    <div className={`mb-6 last:mb-0 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      {children}
    </div>
  );
}

/**
 * FilterChip - Standalone filter chip component
 */
interface FilterChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
}

export function FilterChip({ label, active = false, onClick, onRemove, className = '' }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
        active
          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${className}`}
    >
      <span>{label}</span>
      {onRemove && active && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-2 p-0.5 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </span>
      )}
    </button>
  );
}