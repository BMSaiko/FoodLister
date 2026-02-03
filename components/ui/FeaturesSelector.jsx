import React, { useState } from 'react';
import { Tag, Search, Check, Plus, X } from 'lucide-react';

export default function FeaturesSelector({
  features,
  selectedFeatures,
  onToggleFeature,
  loading = false,
  className = ''
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFeatures = features.filter(feature =>
    feature.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedFeaturesInOrder = features.filter(feature =>
    selectedFeatures.includes(feature.id)
  );

  const handleToggleFeature = (featureId) => {
    onToggleFeature(featureId);
    // Clear search when selecting/deselecting a feature
    setSearchQuery('');
  };

  return (
    <div className={`mb-6 ${className}`}>
      <label className="flex items-center text-gray-700 font-medium mb-3">
        <Tag className="h-4 w-4 mr-2" />
        Características do Restaurante
      </label>

      {/* Campo de busca para características */}
      <div className="relative mb-3">
        <input
          type="text"
          placeholder="Buscar características..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
        />
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
      </div>

      {/* Lista de características disponíveis */}
      {loading ? (
        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          Carregando características...
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
          {filteredFeatures.length > 0 ? (
            filteredFeatures.map(feature => (
              <div
                key={feature.id}
                className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  selectedFeatures.includes(feature.id)
                    ? 'bg-primary border border-primary text-white shadow-sm'
                    : 'bg-white border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                }`}
                onClick={() => handleToggleFeature(feature.id)}
              >
                <span className={`text-sm flex-grow truncate ${
                  selectedFeatures.includes(feature.id) ? 'text-white' : 'text-gray-700'
                }`}>
                  <span className="mr-2">{feature.icon || '🏷️'}</span>
                  {feature.name}
                </span>
                {selectedFeatures.includes(feature.id) ? (
                  <Check className="h-4 w-4 text-white flex-shrink-0 ml-2" />
                ) : (
                  <Plus className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 col-span-full">
              Nenhuma característica encontrada
            </div>
          )}
        </div>
      )}

      {/* Características selecionadas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Características Selecionadas ({selectedFeatures.length})
        </label>

        {selectedFeatures.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedFeaturesInOrder.map(feature => (
              <div
                key={feature.id}
                className="flex items-center bg-primary text-white px-2 py-0.5 rounded-full text-xs font-medium shadow-sm"
              >
                <span className="mr-1">{feature.icon || '🏷️'}</span>
                <span>{feature.name}</span>
                <button
                  type="button"
                  onClick={() => handleToggleFeature(feature.id)}
                  className="ml-1 text-white hover:text-gray-200 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            Nenhuma característica selecionada
          </div>
        )}
      </div>
    </div>
  );
}
