// components/ui/RestaurantFilters.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { createClient } from '@/libs/supabase/client';

const RestaurantFilters = ({ filters, setFilters, applyFilters, clearFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cuisineTypes, setCuisineTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCuisineTypes, setSelectedCuisineTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const supabase = createClient();
  
  // Carregar tipos de cozinha do Supabase
  useEffect(() => {
    async function fetchCuisineTypes() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('cuisine_types')
          .select('*')
          .order('name');
          
        if (error) {
          console.error('Erro ao buscar tipos de cozinha:', error);
        } else {
          setCuisineTypes(data || []);
          
          // Se já existirem filtros de cuisinaType, selecione-os
          if (filters.cuisineTypes && filters.cuisineTypes.length > 0) {
            setSelectedCuisineTypes(filters.cuisineTypes);
          }
        }
      } catch (err) {
        console.error('Erro ao buscar tipos de cozinha:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCuisineTypes();
  }, []);
  
  const handleRangeChange = (e, field) => {
    const value = parseFloat(e.target.value);
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleCheckboxChange = (e, field) => {
    const value = e.target.checked;
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const toggleFilters = () => {
    setIsOpen(!isOpen);
  };
  
  const handleCuisineTypeToggle = (cuisineTypeId) => {
    let updatedTypes;
    
    if (selectedCuisineTypes.includes(cuisineTypeId)) {
      // Remove o tipo de cozinha se já estiver selecionado
      updatedTypes = selectedCuisineTypes.filter(id => id !== cuisineTypeId);
    } else {
      // Adiciona o tipo de cozinha se não estiver selecionado
      updatedTypes = [...selectedCuisineTypes, cuisineTypeId];
    }
    
    setSelectedCuisineTypes(updatedTypes);
    
    // Atualiza os filtros
    setFilters(prev => ({
      ...prev,
      cuisineTypes: updatedTypes
    }));
  };
  
  // Filtrar categorias baseado na busca
  const filteredCuisineTypes = cuisineTypes.filter(type => 
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-3 sm:mb-4">
      <div 
        className="flex justify-between items-center cursor-pointer min-h-[44px] sm:min-h-0"
        onClick={toggleFilters}
      >
        <div className="flex items-center text-gray-800 font-medium text-sm sm:text-base">
          <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-amber-500" />
          <span>Filtros</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 sm:h-4 sm:w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 sm:h-4 sm:w-4 text-gray-500" />
        )}
      </div>
      
      {isOpen && (
        <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
          {/* Filtro de preço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preço máximo por pessoa (€{filters.maxPrice})
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={filters.maxPrice}
              onChange={(e) => handleRangeChange(e, 'maxPrice')}
              className="w-full h-2.5 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
          
          {/* Filtro de avaliação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avaliação mínima ({filters.minRating}★)
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={filters.minRating}
              onChange={(e) => handleRangeChange(e, 'minRating')}
              className="w-full h-2.5 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
          
          {/* Filtro de status de visita */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="visitedFilter"
              checked={filters.visited}
              onChange={(e) => handleCheckboxChange(e, 'visited')}
              className="h-5 w-5 sm:h-4 sm:w-4 text-amber-500 focus:ring-amber-400 border-gray-300 rounded flex-shrink-0"
            />
            <label htmlFor="visitedFilter" className="text-sm font-medium text-gray-700 cursor-pointer">
              Apenas restaurantes visitados
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="notVisitedFilter"
              checked={filters.notVisited}
              onChange={(e) => handleCheckboxChange(e, 'notVisited')}
              className="h-5 w-5 sm:h-4 sm:w-4 text-amber-500 focus:ring-amber-400 border-gray-300 rounded flex-shrink-0"
            />
            <label htmlFor="notVisitedFilter" className="text-sm font-medium text-gray-700 cursor-pointer">
              Apenas restaurantes não visitados
            </label>
          </div>
          
          {/* Filtro por categoria culinária */}
          <div className="mt-3 sm:mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Tipo de Cozinha
            </label>
            
            {/* Campo de busca para categorias */}
            <div className="relative mb-2">
              <input 
                type="text"
                placeholder="Buscar categorias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2 py-2 sm:py-1 border border-gray-300 rounded text-base sm:text-sm min-h-[44px] sm:min-h-0"
              />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            
            {loading ? (
              <div className="text-center py-2 text-gray-500 text-sm">Carregando categorias...</div>
            ) : (
              <div className="max-h-36 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50">
                {filteredCuisineTypes.length > 0 ? (
                  <div className="space-y-2 sm:space-y-1">
                    {filteredCuisineTypes.map(cuisineType => (
                      <div key={cuisineType.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`cuisine-${cuisineType.id}`}
                          checked={selectedCuisineTypes.includes(cuisineType.id)}
                          onChange={() => handleCuisineTypeToggle(cuisineType.id)}
                          className="h-5 w-5 sm:h-4 sm:w-4 text-amber-500 focus:ring-amber-400 border-gray-300 rounded mr-2 flex-shrink-0"
                        />
                        <label htmlFor={`cuisine-${cuisineType.id}`} className="text-sm text-gray-700 cursor-pointer flex-1">
                          {cuisineType.name}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-2 text-gray-500 text-sm">Nenhuma categoria encontrada</div>
                )}
              </div>
            )}
          </div>
          
          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row justify-end pt-3 sm:pt-2 gap-2 sm:gap-0 sm:space-x-2 border-t border-gray-200">
            <button 
              type="button"
              onClick={clearFilters}
              className="px-4 sm:px-3 py-2.5 sm:py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center min-h-[44px] sm:min-h-0"
            >
              <X className="h-4 w-4 sm:h-3 sm:w-3 mr-1" />
              Limpar
            </button>
            <button
              type="button"
              onClick={() => {
                applyFilters();
                setIsOpen(false);
              }}
              className="px-4 sm:px-3 py-2.5 sm:py-1.5 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600 active:bg-amber-700 transition-colors min-h-[44px] sm:min-h-0 font-medium"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantFilters;
