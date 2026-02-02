import React, { useState } from 'react';
import { Tag, Search, Check, Plus, X } from 'lucide-react';

export default function DietaryOptionsSelector({
  dietaryOptions,
  selectedDietaryOptions,
  onToggleDietaryOption,
  loading = false,
  className = ''
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDietaryOptions = dietaryOptions.filter(option =>
    option.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedDietaryOptionsInOrder = dietaryOptions.filter(option =>
    selectedDietaryOptions.includes(option.id)
  );

  const handleToggleDietaryOption = (dietaryOptionId) => {
    onToggleDietaryOption(dietaryOptionId);
    // Clear search when selecting/deselecting a dietary option
    setSearchQuery('');
  };

  return (
    <div className={`mb-6 ${className}`}>
      <label className="flex items-center text-gray-700 font-medium mb-3">
        <Tag className="h-4 w-4 mr-2" />
        Opções Dietéticas
      </label>

      {/* Campo de busca para opções dietéticas */}
      <div className="relative mb-3">
        <input
          type="text"
          placeholder="Buscar opções dietéticas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
        />
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
      </div>

      {/* Lista de opções dietéticas disponíveis */}
      {loading ? (
        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          Carregando opções dietéticas...
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
          {filteredDietaryOptions.length > 0 ? (
            filteredDietaryOptions.map(dietaryOption => (
              <div
                key={dietaryOption.id}
                className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedDietaryOptions.includes(dietaryOption.id)
                    ? 'bg-primary border border-primary text-white shadow-sm'
                    : 'bg-white border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                }`}
                onClick={() => handleToggleDietaryOption(dietaryOption.id)}
              >
                <span className={`text-sm flex-grow truncate ${
                  selectedDietaryOptions.includes(dietaryOption.id) ? 'text-white' : 'text-gray-700'
                }`}>
                  <span className="mr-2">{dietaryOption.icon || '🥗'}</span>
                  {dietaryOption.name}
                </span>
                {selectedDietaryOptions.includes(dietaryOption.id) ? (
                  <Check className="h-4 w-4 text-white flex-shrink-0 ml-2" />
                ) : (
                  <Plus className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 col-span-full">
              Nenhuma opção dietética encontrada
            </div>
          )}
        </div>
      )}

      {/* Opções dietéticas selecionadas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Opções Selecionadas ({selectedDietaryOptions.length})
        </label>

        {selectedDietaryOptions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedDietaryOptionsInOrder.map(dietaryOption => (
              <div
                key={dietaryOption.id}
                className="flex items-center bg-primary text-white px-2 py-0.5 rounded-full text-xs font-medium shadow-sm"
              >
                <span className="mr-1">{dietaryOption.icon || '🥗'}</span>
                <span>{dietaryOption.name}</span>
                <button
                  type="button"
                  onClick={() => handleToggleDietaryOption(dietaryOption.id)}
                  className="ml-1 text-white hover:text-gray-200 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            Nenhuma opção dietética selecionada
          </div>
        )}
      </div>
    </div>
  );
}
