import React, { useState } from 'react';
import { Tag, Search, Check, Plus, X } from 'lucide-react';
import type { CuisineType } from '../../../libs/types';

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
    // Clear search when selecting/deselecting a category
    setSearchQuery('');
  };

  return (
    <div className={`mb-6 ${className}`}>
      <label className="flex items-center text-gray-700 font-medium mb-3">
        <Tag className="h-4 w-4 mr-2" />
        Tipos de Culinária
      </label>

      {/* Campo de busca para tipos de culinária */}
      <div className="relative mb-3">
        <input
          type="text"
          placeholder="Buscar tipos de culinária..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
        />
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
      </div>

      {/* Lista de tipos de culinária disponíveis */}
      {loading ? (
        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          Carregando tipos de culinária...
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
          {filteredCuisineTypes.length > 0 ? (
            filteredCuisineTypes.map(cuisineType => (
              <div
                key={cuisineType.id}
                className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  selectedCuisineTypes.includes(cuisineType.id)
                    ? 'bg-primary border border-primary text-white shadow-sm'
                    : 'bg-white border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                }`}
                onClick={() => handleToggleCuisine(cuisineType.id)}
              >
                <span className={`text-sm flex-grow truncate ${
                  selectedCuisineTypes.includes(cuisineType.id) ? 'text-white' : 'text-gray-700'
                }`}>
                  <span className="mr-2">{cuisineType.icon || '🍽️'}</span>
                  {cuisineType.name}
                </span>
                {selectedCuisineTypes.includes(cuisineType.id) ? (
                  <Check className="h-4 w-4 text-white flex-shrink-0 ml-2" />
                ) : (
                  <Plus className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 col-span-full">
              Nenhum tipo de culinária encontrado
            </div>
          )}
        </div>
      )}

      {/* Tipos de culinária selecionados */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipos Selecionados ({selectedCuisineTypes.length})
        </label>

        {selectedCuisineTypes.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedCuisineTypesInOrder.map(cuisineType => (
              <div
                key={cuisineType.id}
                className="flex items-center bg-primary text-white px-2 py-0.5 rounded-full text-xs font-medium shadow-sm"
              >
                <span className="mr-1">{cuisineType.icon || '🍽️'}</span>
                <span>{cuisineType.name}</span>
                <button
                  type="button"
                  onClick={() => handleToggleCuisine(cuisineType.id)}
                  className="ml-1 text-white hover:text-gray-200 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            Nenhum tipo de culinária selecionado
          </div>
        )}
      </div>
    </div>
  );
}
