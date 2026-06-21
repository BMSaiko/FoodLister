import React, { useState } from 'react';
import { Tag, Search, Check, Plus, X } from 'lucide-react';

interface CuisineType {
  id: string;
  name: string;
  icon?: string;
  [key: string]: any;
}

export default function CuisineSelector({
  cuisineTypes,
  selectedCuisineTypes,
  onToggleCuisine,
  loading = false,
  className = ''
}: {
  cuisineTypes: CuisineType[];
  selectedCuisineTypes: string[];
  onToggleCuisine: (cuisineTypeId: string) => void;
  loading?: boolean;
  className?: string;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCuisineTypes = cuisineTypes.filter(type =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCuisineTypesInOrder = cuisineTypes.filter(type =>
    selectedCuisineTypes.includes(type.id)
  );

  const handleToggleCuisine = (cuisineTypeId: string) => {
    onToggleCuisine(cuisineTypeId);
    setSearchQuery('');
  };

  return (
    <div className={`mb-6 ${className}`}>
      <label className="flex items-center text-[var(--gray-300)] font-medium mb-3">
        <Tag className="h-4 w-4 mr-2" />
        Tipos de Culinária
      </label>

      <div className="relative mb-3">
        <input
          type="text"
          placeholder="Buscar tipos de culinária..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-2 bg-[var(--card-bg)] border border-[var(--gray-200)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors placeholder-[var(--gray-500)]"
        />
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--gray-500)]" />
      </div>

      {loading ? (
        <div className="text-center py-6 text-[var(--gray-500)] bg-[var(--card-bg)] rounded-lg border border-[var(--gray-200)]">
          Carregando tipos de culinária...
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto bg-[var(--card-bg)] p-4 rounded-lg border border-[var(--gray-200)] mb-4">
          {filteredCuisineTypes.length > 0 ? (
            filteredCuisineTypes.map(cuisineType => (
              <div
                key={cuisineType.id}
                className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  selectedCuisineTypes.includes(cuisineType.id)
                    ? 'bg-[var(--primary)] border border-[var(--primary)] text-black shadow-sm'
                    : 'bg-[var(--background-secondary)] border border-[var(--gray-200)] hover:bg-[var(--background-tertiary)] hover:border-[var(--gray-300)]'
                }`}
                onClick={() => handleToggleCuisine(cuisineType.id)}
              >
                <span className={`text-sm flex-grow truncate ${
                  selectedCuisineTypes.includes(cuisineType.id) ? 'text-black' : 'text-[var(--gray-300)]'
                }`}>
                  <span className="mr-2">{cuisineType.icon || '🍽️'}</span>
                  {cuisineType.name}
                </span>
                {selectedCuisineTypes.includes(cuisineType.id) ? (
                  <Check className="h-4 w-4 text-black flex-shrink-0 ml-2" />
                ) : (
                  <Plus className="h-4 w-4 text-[var(--gray-500)] flex-shrink-0 ml-2" />
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-[var(--gray-500)] col-span-full">
              Nenhum tipo de culinária encontrado
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[var(--gray-300)] mb-2">
          Tipos Selecionados ({selectedCuisineTypes.length})
        </label>

        {selectedCuisineTypes.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedCuisineTypesInOrder.map(cuisineType => (
              <div
                key={cuisineType.id}
                className="flex items-center bg-[var(--primary)] text-black px-2 py-0.5 rounded-full text-xs font-medium shadow-sm"
              >
                <span className="mr-1">{cuisineType.icon || '🍽️'}</span>
                <span>{cuisineType.name}</span>
                <button
                  type="button"
                  onClick={() => handleToggleCuisine(cuisineType.id)}
                  className="ml-1 text-black hover:text-[var(--gray-800)] transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-[var(--gray-500)] bg-[var(--card-bg)] px-3 py-2 rounded-lg border border-[var(--gray-200)]">
            Nenhum tipo de culinária selecionado
          </div>
        )}
      </div>
    </div>
  );
}
