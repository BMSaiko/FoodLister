import React, { useState } from 'react';
import { Tag, Search, Check, Plus, X } from 'lucide-react';

interface DietaryOption {
  id: string;
  name: string;
  icon?: string;
  [key: string]: any;
}

interface DietaryOptionsSelectorProps {
  dietaryOptions: DietaryOption[];
  selectedDietaryOptions: string[];
  onToggleDietaryOption: (dietaryOptionId: string) => void;
  loading?: boolean;
  className?: string;
}

export default function DietaryOptionsSelector({
  dietaryOptions,
  selectedDietaryOptions,
  onToggleDietaryOption,
  loading = false,
  className = ''
}: DietaryOptionsSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDietaryOptions = dietaryOptions.filter(option =>
    option.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedDietaryOptionsInOrder = dietaryOptions.filter(option =>
    selectedDietaryOptions.includes(option.id)
  );

  const handleToggleDietaryOption = (dietaryOptionId: string) => {
    onToggleDietaryOption(dietaryOptionId);
    setSearchQuery('');
  };

  return (
    <div className={`mb-6 ${className}`}>
      <label className="flex items-center text-[var(--gray-300)] font-medium mb-3">
        <Tag className="h-4 w-4 mr-2" />
        Opções Dietéticas
      </label>

      <div className="relative mb-3">
        <input
          type="text"
          placeholder="Buscar opções dietéticas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-2 bg-[var(--card-bg)] border border-[var(--gray-200)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors placeholder-[var(--gray-500)]"
        />
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--gray-500)]" />
      </div>

      {loading ? (
        <div className="text-center py-6 text-[var(--gray-500)] bg-[var(--card-bg)] rounded-lg border border-[var(--gray-200)]">
          Carregando opções dietéticas...
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto bg-[var(--card-bg)] p-4 rounded-lg border border-[var(--gray-200)] mb-4">
          {filteredDietaryOptions.length > 0 ? (
            filteredDietaryOptions.map(dietaryOption => (
              <div
                key={dietaryOption.id}
                className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  selectedDietaryOptions.includes(dietaryOption.id)
                    ? 'bg-[var(--primary)] border border-[var(--primary)] text-black shadow-sm'
                    : 'bg-[var(--background-secondary)] border border-[var(--gray-200)] hover:bg-[var(--background-tertiary)] hover:border-[var(--gray-300)]'
                }`}
                onClick={() => handleToggleDietaryOption(dietaryOption.id)}
              >
                <span className={`text-sm flex-grow truncate ${
                  selectedDietaryOptions.includes(dietaryOption.id) ? 'text-black' : 'text-[var(--gray-300)]'
                }`}>
                  <span className="mr-2">{dietaryOption.icon || '🥗'}</span>
                  {dietaryOption.name}
                </span>
                {selectedDietaryOptions.includes(dietaryOption.id) ? (
                  <Check className="h-4 w-4 text-black flex-shrink-0 ml-2" />
                ) : (
                  <Plus className="h-4 w-4 text-[var(--gray-500)] flex-shrink-0 ml-2" />
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-[var(--gray-500)] col-span-full">
              Nenhuma opção dietética encontrada
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[var(--gray-300)] mb-2">
          Opções Selecionadas ({selectedDietaryOptions.length})
        </label>

        {selectedDietaryOptions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedDietaryOptionsInOrder.map(dietaryOption => (
              <div
                key={dietaryOption.id}
                className="flex items-center bg-[var(--primary)] text-black px-2 py-0.5 rounded-full text-xs font-medium shadow-sm"
              >
                <span className="mr-1">{dietaryOption.icon || '🥗'}</span>
                <span>{dietaryOption.name}</span>
                <button
                  type="button"
                  onClick={() => handleToggleDietaryOption(dietaryOption.id)}
                  className="ml-1 text-black hover:text-[var(--gray-800)] transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-[var(--gray-500)] bg-[var(--card-bg)] px-3 py-2 rounded-lg border border-[var(--gray-200)]">
            Nenhuma opção dietética selecionada
          </div>
        )}
      </div>
    </div>
  );
}
