"use client";

import React from 'react';
import { Globe, Lock, Filter, Search, Plus, X, Loader2, Star, Euro } from 'lucide-react';
import type { ListFilters, FilterOption, Restaurant } from '@/hooks/lists/useListFilters';

interface VisibilityToggleProps {
  isPublic: boolean;
  onChange: (isPublic: boolean) => void;
}

export const VisibilityToggle: React.FC<VisibilityToggleProps> = ({ isPublic, onChange }) => (
  <div className="mb-6">
    <label className="block text-[var(--foreground-secondary)] font-semibold mb-2">
      Visibilidade
    </label>
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
          isPublic 
            ? 'border-[var(--primary)] bg-gradient-to-br from-[var(--primary-50)] to-[var(--primary-100)] text-[var(--primary-dark)] shadow-sm' 
            : 'border-[var(--card-border)] text-[var(--foreground-muted)] hover:border-[var(--primary-light)] hover:bg-[var(--background-secondary)]'
        }`}
      >
        <Globe className="h-5 w-5" />
        <span className="font-medium">Pública</span>
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
          !isPublic 
            ? 'border-[var(--primary)] bg-gradient-to-br from-[var(--primary-50)] to-[var(--primary-100)] text-[var(--primary-dark)] shadow-sm' 
            : 'border-[var(--card-border)] text-[var(--foreground-muted)] hover:border-[var(--primary-light)] hover:bg-[var(--background-secondary)]'
        }`}
      >
        <Lock className="h-5 w-5" />
        <span className="font-medium">Privada</span>
      </button>
    </div>
    <p className="text-xs text-[var(--foreground-muted)] mt-2 flex items-center gap-1">
      {isPublic ? (
        <><Globe className="h-3 w-3" /> Qualquer pessoa pode ver esta lista</>
      ) : (
        <><Lock className="h-3 w-3" /> Apenas você pode ver esta lista</>
      )}
    </p>
  </div>
);

interface ModeSelectorProps {
  mode: 'manual' | 'filters';
  onChange: (mode: 'manual' | 'filters') => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, onChange }) => (
  <div className="mb-6">
    <label className="block text-[var(--foreground-secondary)] font-semibold mb-2">
      Como adicionar restaurantes?
    </label>
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => onChange('manual')}
        className={`flex-1 p-3 rounded-xl border-2 transition-all duration-200 font-medium ${
          mode === 'manual'
            ? 'border-[var(--primary)] bg-gradient-to-br from-[var(--primary-50)] to-[var(--primary-100)] text-[var(--primary-dark)] shadow-sm'
            : 'border-[var(--card-border)] text-[var(--foreground-muted)] hover:border-[var(--primary-light)] hover:bg-[var(--background-secondary)]'
        }`}
      >
        Seleção Manual
      </button>
      <button
        type="button"
        onClick={() => onChange('filters')}
        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 font-medium ${
          mode === 'filters'
            ? 'border-[var(--primary)] bg-gradient-to-br from-[var(--primary-50)] to-[var(--primary-100)] text-[var(--primary-dark)] shadow-sm'
            : 'border-[var(--card-border)] text-[var(--foreground-muted)] hover:border-[var(--primary-light)] hover:bg-[var(--background-secondary)]'
        }`}
      >
        <Filter className="h-5 w-5" />
        Usar Filtros
      </button>
    </div>
  </div>
);

interface FilterChipsProps {
  options: FilterOption[];
  selected: string[];
  onToggle: (id: string) => void;
  title: string;
}

export const FilterChips: React.FC<FilterChipsProps> = ({ options, selected, onToggle, title }) => (
  <div>
    <h4 className="text-sm font-semibold text-[var(--foreground-secondary)] mb-2">{title}</h4>
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onToggle(opt.id)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
            selected.includes(opt.id)
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)] shadow-sm'
              : 'bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--card-border)] hover:border-[var(--primary-light)] hover:bg-[var(--primary-50)]'
          }`}
        >
          {opt.name}
        </button>
      ))}
    </div>
  </div>
);

interface PriceRangeSliderProps {
  value: [number, number];
  onChange: (min: number, max: number) => void;
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({ value, onChange }) => (
  <div>
    <h4 className="text-sm font-semibold text-[var(--foreground-secondary)] mb-2 flex items-center gap-2">
      <Euro className="h-4 w-4" />
      Preço: €{value[0]} - €{value[1]}
    </h4>
    <div className="flex gap-4 items-center">
      <div className="flex-1">
        <input
          type="range"
          min="0"
          max="100"
          value={value[0]}
          onChange={(e) => onChange(Math.min(parseInt(e.target.value), value[1]), value[1])}
          className="w-full accent-[var(--primary)]"
        />
      </div>
      <div className="flex-1">
        <input
          type="range"
          min="0"
          max="100"
          value={value[1]}
          onChange={(e) => onChange(value[0], Math.max(parseInt(e.target.value), value[0]))}
          className="w-full accent-[var(--primary)]"
        />
      </div>
    </div>
  </div>
);

interface RatingSliderProps {
  value: number;
  onChange: (rating: number) => void;
}

export const RatingSlider: React.FC<RatingSliderProps> = ({ value, onChange }) => (
  <div>
    <h4 className="text-sm font-semibold text-[var(--foreground-secondary)] mb-2 flex items-center gap-2">
      <Star className="h-4 w-4" />
      Avaliação Mínima: {value}★
    </h4>
    <input
      type="range"
      min="0"
      max="5"
      step="0.5"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full accent-[var(--primary)]"
    />
  </div>
);

interface RestaurantSearchProps {
  restaurants: Restaurant[];
  selectedRestaurants: Restaurant[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAdd: (restaurant: Restaurant) => void;
}

export const RestaurantSearch: React.FC<RestaurantSearchProps> = ({ 
  restaurants, 
  selectedRestaurants, 
  searchQuery, 
  onSearchChange, 
  onAdd 
}) => {
  const availableRestaurants = restaurants.filter(
    r => !selectedRestaurants.some(s => s.id === r.id)
  );
  
  const filtered = searchQuery === '' 
    ? availableRestaurants 
    : availableRestaurants.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-[var(--foreground-muted)]" />
        <input
          type="text"
          placeholder="Procurar restaurantes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-[var(--card-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)] focus:border-transparent"
        />
      </div>
      
      <div className="max-h-48 overflow-y-auto bg-[var(--background-secondary)] rounded-xl border border-[var(--card-border)]">
        {filtered.length > 0 ? (
          <ul className="divide-y divide-[var(--card-border)]">
            {filtered.map(restaurant => (
              <li 
                key={restaurant.id} 
                className="p-3 hover:bg-[var(--primary-50)] cursor-pointer flex justify-between items-center transition-colors"
                onClick={() => onAdd(restaurant)}
              >
                <div className="pr-2">
                  <div className="font-medium text-sm line-clamp-1">{restaurant.name}</div>
                  <div className="text-xs text-[var(--foreground-muted)]">
                    {restaurant.price_per_person != null ? `€${restaurant.price_per_person.toFixed(2)}` : '€--'} 
                    {' • '}
                    {restaurant.rating != null ? `${restaurant.rating.toFixed(1)}★` : '--★'}
                  </div>
                </div>
                <Plus className="h-5 w-5 text-[var(--primary-dark)] flex-shrink-0" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-[var(--foreground-muted)] text-sm">
            Nenhum restaurante encontrado
          </div>
        )}
      </div>
    </div>
  );
};

interface SelectedRestaurantsProps {
  restaurants: Array<{ id: string; name: string }>;
  onRemove: (id: string) => void;
}

export const SelectedRestaurants: React.FC<SelectedRestaurantsProps> = ({ restaurants, onRemove }) => (
  <div className="mb-6">
    <h3 className="font-semibold text-[var(--foreground-secondary)] mb-2 flex items-center gap-2">
      Restaurantes Selecionados 
      <span className="bg-[var(--primary-50)] text-[var(--primary-dark)] text-xs font-bold px-2 py-0.5 rounded-full">
        {restaurants.length}
      </span>
    </h3>
    {restaurants.length > 0 ? (
      <ul className="space-y-2 max-h-48 overflow-y-auto">
        {restaurants.map(restaurant => (
          <li key={restaurant.id} className="flex justify-between items-center bg-gradient-to-r from-[var(--primary-50)] to-[var(--orange-50)] p-3 rounded-xl border border-[var(--primary-light)]">
            <span className="text-sm font-medium line-clamp-1 mr-2">{restaurant.name}</span>
            <button
              type="button"
              onClick={() => onRemove(restaurant.id)}
              className="text-[var(--foreground-muted)] hover:text-red-500 transition-colors flex-shrink-0 p-1 rounded-full hover:bg-[var(--card-bg)]"
              aria-label="Remover restaurante"
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-[var(--foreground-muted)] text-sm italic">
        Nenhum restaurante selecionado
      </p>
    )}
  </div>
);

interface FilterPreviewProps {
  restaurants: Restaurant[];
  loading: boolean;
}

export const FilterPreview: React.FC<FilterPreviewProps> = ({ restaurants, loading }) => (
  <div className="mt-4 p-4 bg-[var(--background-secondary)] rounded-xl border border-[var(--card-border)]">
    <h4 className="text-sm font-semibold text-[var(--foreground-secondary)] mb-2">
      Restaurantes Encontrados
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin inline ml-2 text-[var(--primary)]" />
      ) : (
        <span className="ml-2 bg-[var(--primary-50)] text-[var(--primary-dark)] text-xs font-bold px-2 py-0.5 rounded-full">
          {restaurants.length}
        </span>
      )}
    </h4>
    {loading ? (
      <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
        <span className="text-sm">A carregar...</span>
      </div>
    ) : restaurants.length > 0 ? (
      <div className="max-h-32 overflow-y-auto space-y-1">
        {restaurants.slice(0, 5).map(r => (
          <div key={r.id} className="text-sm text-[var(--foreground)] flex justify-between">
            <span className="line-clamp-1">{r.name}</span>
            <span className="text-[var(--foreground-muted)] flex-shrink-0 ml-2">
              €{r.price_per_person?.toFixed(2)} • {r.rating?.toFixed(1)}★
            </span>
          </div>
        ))}
        {restaurants.length > 5 && (
          <div className="text-xs text-[var(--primary-dark)] font-medium">
            +{restaurants.length - 5} mais restaurantes
          </div>
        )}
      </div>
    ) : (
      <p className="text-sm text-[var(--foreground-muted)] italic">Nenhum restaurante corresponde aos filtros</p>
    )}
  </div>
);
