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
    <label className="block text-gray-700 font-semibold mb-2">
      Visibilidade
    </label>
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
          isPublic 
            ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 shadow-sm' 
            : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
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
            ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 shadow-sm' 
            : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        <Lock className="h-5 w-5" />
        <span className="font-medium">Privada</span>
      </button>
    </div>
    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
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
    <label className="block text-gray-700 font-semibold mb-2">
      Como adicionar restaurantes?
    </label>
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => onChange('manual')}
        className={`flex-1 p-3 rounded-xl border-2 transition-all duration-200 font-medium ${
          mode === 'manual'
            ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 shadow-sm'
            : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        Seleção Manual
      </button>
      <button
        type="button"
        onClick={() => onChange('filters')}
        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 font-medium ${
          mode === 'filters'
            ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 shadow-sm'
            : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
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
    <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onToggle(opt.id)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
            selected.includes(opt.id)
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-500 shadow-sm'
              : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400 hover:bg-amber-50'
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
    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
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
          className="w-full accent-amber-500"
        />
      </div>
      <div className="flex-1">
        <input
          type="range"
          min="0"
          max="100"
          value={value[1]}
          onChange={(e) => onChange(value[0], Math.max(parseInt(e.target.value), value[0]))}
          className="w-full accent-amber-500"
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
    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
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
      className="w-full accent-amber-500"
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
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Procurar restaurantes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
      </div>
      
      <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-xl border border-gray-200">
        {filtered.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filtered.map(restaurant => (
              <li 
                key={restaurant.id} 
                className="p-3 hover:bg-amber-50 cursor-pointer flex justify-between items-center transition-colors"
                onClick={() => onAdd(restaurant)}
              >
                <div className="pr-2">
                  <div className="font-medium text-sm line-clamp-1">{restaurant.name}</div>
                  <div className="text-xs text-gray-500">
                    {restaurant.price_per_person != null ? `€${restaurant.price_per_person.toFixed(2)}` : '€--'} 
                    {' • '}
                    {restaurant.rating != null ? `${restaurant.rating.toFixed(1)}★` : '--★'}
                  </div>
                </div>
                <Plus className="h-5 w-5 text-amber-600 flex-shrink-0" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-gray-500 text-sm">
            Nenhum restaurante encontrado
          </div>
        )}
      </div>
    </div>
  );
};

interface SelectedRestaurantsProps {
  restaurants: Restaurant[];
  onRemove: (id: string) => void;
}

export const SelectedRestaurants: React.FC<SelectedRestaurantsProps> = ({ restaurants, onRemove }) => (
  <div className="mb-6">
    <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
      Restaurantes Selecionados 
      <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
        {restaurants.length}
      </span>
    </h3>
    {restaurants.length > 0 ? (
      <ul className="space-y-2 max-h-48 overflow-y-auto">
        {restaurants.map(restaurant => (
          <li key={restaurant.id} className="flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-xl border border-amber-100">
            <span className="text-sm font-medium line-clamp-1 mr-2">{restaurant.name}</span>
            <button
              type="button"
              onClick={() => onRemove(restaurant.id)}
              className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 p-1 rounded-full hover:bg-white"
              aria-label="Remover restaurante"
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-400 text-sm italic">
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
  <div className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
    <h4 className="text-sm font-semibold text-gray-700 mb-2">
      Restaurantes Encontrados
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin inline ml-2 text-amber-500" />
      ) : (
        <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
          {restaurants.length}
        </span>
      )}
    </h4>
    {loading ? (
      <div className="flex items-center gap-2 text-gray-500">
        <span className="text-sm">A carregar...</span>
      </div>
    ) : restaurants.length > 0 ? (
      <div className="max-h-32 overflow-y-auto space-y-1">
        {restaurants.slice(0, 5).map(r => (
          <div key={r.id} className="text-sm text-gray-600 flex justify-between">
            <span className="line-clamp-1">{r.name}</span>
            <span className="text-gray-400 flex-shrink-0 ml-2">
              €{r.price_per_person?.toFixed(2)} • {r.rating?.toFixed(1)}★
            </span>
          </div>
        ))}
        {restaurants.length > 5 && (
          <div className="text-xs text-amber-600 font-medium">
            +{restaurants.length - 5} mais restaurantes
          </div>
        )}
      </div>
    ) : (
      <p className="text-sm text-gray-500 italic">Nenhum restaurante corresponde aos filtros</p>
    )}
  </div>
);