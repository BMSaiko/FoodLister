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
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={toggleFilters}
      >
        <div className="flex items-center text-gray-800 font-medium">
          <Filter className="h-4 w-4 mr-2 text-amber-500" />
          <span>Filtros</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </div>
      
      {isOpen && (
        <div className="mt-4 space-y-4">
          {/* Filtro de preço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço máximo por pessoa (€{filters.maxPrice})
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={filters.maxPrice}
              onChange={(e) => handleRangeChange(e, 'maxPrice')}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
          
          {/* Filtro de avaliação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Avaliação mínima ({filters.minRating}★)
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={filters.minRating}
              onChange={(e) => handleRangeChange(e, 'minRating')}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
          
          {/* Filtro de status de visita */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="visitedFilter"
              checked={filters.visited}
              onChange={(e) => handleCheckboxChange(e, 'visited')}
              className="h-4 w-4 text-amber-500 focus:ring-amber-400 border-gray-300 rounded"
            />
            <label htmlFor="visitedFilter" className="text-sm font-medium text-gray-700">
              Apenas restaurantes visitados
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="notVisitedFilter"
              checked={filters.notVisited}
              onChange={(e) => handleCheckboxChange(e, 'notVisited')}
              className="h-4 w-4 text-amber-500 focus:ring-amber-400 border-gray-300 rounded"
            />
            <label htmlFor="notVisitedFilter" className="text-sm font-medium text-gray-700">
              Apenas restaurantes não visitados
            </label>
          </div>
          
          {/* Filtro por categoria culinária */}
          <div className="mt-4">
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
                className="w-full pl-8 pr-2 py-1 border border-gray-300 rounded text-sm"
              />
              <Search className="absolute left-2 top-1.5 h-4 w-4 text-gray-400" />
            </div>
            
            {loading ? (
              <div className="text-center py-2 text-gray-500 text-sm">Carregando categorias...</div>
            ) : (
              <div className="max-h-36 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50">
                {filteredCuisineTypes.length > 0 ? (
                  <div className="space-y-1">
                    {filteredCuisineTypes.map(cuisineType => (
                      <div key={cuisineType.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`cuisine-${cuisineType.id}`}
                          checked={selectedCuisineTypes.includes(cuisineType.id)}
                          onChange={() => handleCuisineTypeToggle(cuisineType.id)}
                          className="h-4 w-4 text-amber-500 focus:ring-amber-400 border-gray-300 rounded mr-2"
                        />
                        <label htmlFor={`cuisine-${cuisineType.id}`} className="text-sm text-gray-700 cursor-pointer">
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
          <div className="flex justify-end pt-2 space-x-2 border-t border-gray-200">
            <button 
              type="button"
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
            >
              <X className="h-3 w-3 mr-1" />
              Limpar
            </button>
            <button 
              type="button"
              onClick={applyFilters}
              className="px-3 py-1.5 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
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