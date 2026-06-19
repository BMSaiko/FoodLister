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
    <div className={`bg-[var(--card-bg)] rounded-[var(--radius-2xl)] shadow-lg border border-[var(--card-border)] overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-[var(--background-secondary)] transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[var(--primary)] to-[var(--orange-500)] rounded-[var(--radius-xl)] shadow-md">
            <Filter className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <span className="block text-lg font-bold text-[var(--foreground)]">{title}</span>
            {activeFilters.length > 0 && (
              <span className="text-sm text-[var(--primary)] font-medium">
                {activeFilters.length} {activeFilters.length === 1 ? 'filtro ativo' : 'filtros ativos'}
              </span>
            )}
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-[var(--foreground-muted)]" />
        ) : (
          <ChevronDown className="h-5 w-5 text-[var(--foreground-muted)]" />
        )}
      </button>

      {/* Active Filters Chips */}
      {activeFilters.length > 0 && (
        <div className="px-4 sm:px-6 pb-3">
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(filter => (
              <span
                key={filter.id}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-[var(--primary-50)] to-[var(--orange-50)] text-[var(--primary-dark)] border border-[var(--primary-light)]/80 shadow-sm group"
              >
                <span className="mr-2 w-2 h-2 bg-[var(--primary)] rounded-full"></span>
                <span className="font-medium">{filter.label}</span>
                <button
                  onClick={filter.onRemove}
                  className="ml-2 p-0.5 rounded-full hover:bg-[var(--primary-light)]/50 transition-colors"
                  aria-label="Remover filtro"
                >
                  <X className="h-3.5 w-3.5 text-[var(--primary-dark)]" />
                </button>
              </span>
            ))}
            {onClearAll && (
              <button
                onClick={onClearAll}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)] transition-colors"
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
      <h3 className="text-sm font-semibold text-[var(--foreground-secondary)] mb-3">{title}</h3>
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
          ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--orange-500)] text-[var(--primary-foreground)] shadow-md'
          : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]'
      } ${className}`}
    >
      <span>{label}</span>
      {onRemove && active && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-2 p-0.5 rounded-full hover:bg-[var(--primary-foreground)]/20 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </span>
      )}
    </button>
  );
}
