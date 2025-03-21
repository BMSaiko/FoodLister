// components/ui/RestaurantFilters.jsx
'use client';

import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

const RestaurantFilters = ({ filters, setFilters, applyFilters, clearFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  
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