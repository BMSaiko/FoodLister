// components/ui/RestaurantRoulette.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/libs/supabase/client';
import { RotateCcw, ChefHat, Filter, X, Search } from 'lucide-react';
import Link from 'next/link';
import RestaurantCard from './RestaurantCard';

const RestaurantRoulette = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [rotation, setRotation] = useState(0);
  
  // Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filterNotVisited, setFilterNotVisited] = useState(false);
  const [selectedCuisineTypes, setSelectedCuisineTypes] = useState([]);
  const [cuisineTypes, setCuisineTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const supabase = createClient();
  
  // Carregar restaurantes e categorias
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Buscar restaurantes com categorias
        const { data: restaurantsData, error: restaurantsError } = await supabase
          .from('restaurants')
          .select(`
            *,
            cuisine_types:restaurant_cuisine_types(
              cuisine_type:cuisine_types(*)
            )
          `);
        
        if (restaurantsError) throw restaurantsError;
        
        // Buscar categorias
        const { data: cuisineData, error: cuisineError } = await supabase
          .from('cuisine_types')
          .select('*')
          .order('name');
        
        if (cuisineError) throw cuisineError;
        
        // Processar dados dos restaurantes
        const processedRestaurants = restaurantsData.map(restaurant => ({
          ...restaurant,
          cuisine_types: restaurant.cuisine_types
            ? restaurant.cuisine_types.map(rel => rel.cuisine_type)
            : []
        }));
        
        setRestaurants(processedRestaurants || []);
        setCuisineTypes(cuisineData || []);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Aplicar filtros
  useEffect(() => {
    let filtered = [...restaurants];
    
    // Filtro de não visitados
    if (filterNotVisited) {
      filtered = filtered.filter(r => !r.visited);
    }
    
    // Filtro de categorias
    if (selectedCuisineTypes.length > 0) {
      filtered = filtered.filter(restaurant => {
        const restaurantCuisineIds = restaurant.cuisine_types.map(type => type.id);
        return selectedCuisineTypes.some(cuisineId => 
          restaurantCuisineIds.includes(cuisineId)
        );
      });
    }
    
    setFilteredRestaurants(filtered);
    setSelectedRestaurant(null);
  }, [restaurants, filterNotVisited, selectedCuisineTypes]);
  
  const handleSpin = () => {
    if (filteredRestaurants.length === 0) {
      alert('Não há restaurantes disponíveis com os filtros selecionados!');
      return;
    }
    
    setSpinning(true);
    setSelectedRestaurant(null);
    
    // Rotação aleatória (múltiplas voltas + posição final)
    const randomRotation = 3600 + Math.random() * 360;
    setRotation(prev => prev + randomRotation);
    
    // Escolher restaurante aleatório após animação
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * filteredRestaurants.length);
      setSelectedRestaurant(filteredRestaurants[randomIndex]);
      setSpinning(false);
    }, 3000);
  };
  
  const handleCuisineTypeToggle = (cuisineTypeId) => {
    if (selectedCuisineTypes.includes(cuisineTypeId)) {
      setSelectedCuisineTypes(selectedCuisineTypes.filter(id => id !== cuisineTypeId));
    } else {
      setSelectedCuisineTypes([...selectedCuisineTypes, cuisineTypeId]);
    }
  };
  
  const clearFilters = () => {
    setFilterNotVisited(false);
    setSelectedCuisineTypes([]);
    setSearchQuery('');
  };
  
  const filteredCuisineTypes = cuisineTypes.filter(type => 
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const availableCount = filteredRestaurants.length;
  const totalCount = restaurants.length;
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <ChefHat className="h-6 w-6 mr-2 text-amber-500" />
            Roleta de Restaurantes
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </button>
        </div>
        
        {/* Painel de filtros */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="space-y-4">
              {/* Filtro de não visitados */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notVisitedFilter"
                  checked={filterNotVisited}
                  onChange={(e) => setFilterNotVisited(e.target.checked)}
                  className="h-4 w-4 text-amber-500 focus:ring-amber-400 border-gray-300 rounded"
                />
                <label htmlFor="notVisitedFilter" className="text-sm font-medium text-gray-700">
                  Apenas restaurantes não visitados
                </label>
              </div>
              
              {/* Filtro de categorias */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Categoria
                </label>
                
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
              </div>
              
              <div className="flex justify-end pt-2 border-t border-gray-200">
                <button 
                  onClick={clearFilters}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpar
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Estatísticas */}
        <div className="mt-4 text-sm text-gray-600">
          {availableCount > 0 ? (
            <p>
              <span className="font-semibold">{availableCount}</span> restaurante{availableCount !== 1 ? 's' : ''} disponível{availableCount !== 1 ? 'eis' : ''} 
              {totalCount !== availableCount && (
                <span> de {totalCount} total</span>
              )}
            </p>
          ) : (
            <p className="text-red-500">
              Nenhum restaurante disponível com os filtros selecionados
            </p>
          )}
        </div>
      </div>
      
      {/* Roleta */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col items-center">
          <div className="relative w-80 h-80 mb-6">
            {/* SVG Roleta com nomes */}
            <svg
              width="320"
              height="320"
              viewBox="0 0 320 320"
              className="absolute inset-0"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
              }}
            >
              <defs>
                {/* Gradientes para cada seção */}
                {filteredRestaurants.map((_, i) => {
                  const colors = ['#F59E0B', '#F97316', '#EF4444', '#EC4899', '#8B5CF6', '#6366F1', '#3B82F6', '#10B981', '#14B8A6', '#06B6D4'];
                  const color = colors[i % colors.length];
                  return (
                    <linearGradient key={i} id={`gradient-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={color} stopOpacity="1" />
                      <stop offset="100%" stopColor={color} stopOpacity="0.8" />
                    </linearGradient>
                  );
                })}
              </defs>
              
              {/* Seções da roleta */}
              {filteredRestaurants.length > 0 ? filteredRestaurants.map((restaurant, i) => {
                const total = filteredRestaurants.length;
                const anglePerSlice = 360 / total;
                const startAngle = (i * anglePerSlice - 90) * (Math.PI / 180);
                const endAngle = ((i + 1) * anglePerSlice - 90) * (Math.PI / 180);
                const centerX = 160;
                const centerY = 160;
                const radius = 140;
                const innerRadius = 60;
                
                // Calcular pontos do arco
                const x1 = centerX + radius * Math.cos(startAngle);
                const y1 = centerY + radius * Math.sin(startAngle);
                const x2 = centerX + radius * Math.cos(endAngle);
                const y2 = centerY + radius * Math.sin(endAngle);
                const x3 = centerX + innerRadius * Math.cos(endAngle);
                const y3 = centerY + innerRadius * Math.sin(endAngle);
                const x4 = centerX + innerRadius * Math.cos(startAngle);
                const y4 = centerY + innerRadius * Math.sin(startAngle);
                
                const largeArcFlag = anglePerSlice > 180 ? 1 : 0;
                
                const pathData = `
                  M ${centerX} ${centerY}
                  L ${x1} ${y1}
                  A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
                  L ${x3} ${y3}
                  A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
                  Z
                `;
                
                // Calcular posição do texto (meio da seção)
                const textAngle = ((i + 0.5) * anglePerSlice - 90) * (Math.PI / 180);
                const textRadius = (radius + innerRadius) / 2;
                const textX = centerX + textRadius * Math.cos(textAngle);
                const textY = centerY + textRadius * Math.sin(textAngle);
                const textRotation = (i + 0.5) * anglePerSlice;
                
                // Ajustar tamanho da fonte baseado no número de restaurantes
                const fontSize = total <= 6 ? 14 : total <= 10 ? 12 : 10;
                const maxLength = total <= 6 ? 18 : total <= 10 ? 15 : 12;
                const displayName = restaurant.name.length > maxLength 
                  ? restaurant.name.substring(0, maxLength - 3) + '...' 
                  : restaurant.name;
                
                return (
                  <g key={restaurant.id}>
                    <path
                      d={pathData}
                      fill={`url(#gradient-${i})`}
                      stroke="#fff"
                      strokeWidth="2"
                    />
                    {/* Texto do nome do restaurante */}
                    <text
                      x={textX}
                      y={textY}
                      transform={`rotate(${textRotation} ${textX} ${textY})`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={fontSize}
                      fill="white"
                      stroke="rgba(0,0,0,0.5)"
                      strokeWidth="1"
                      fontWeight="bold"
                      style={{
                        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                      }}
                    >
                      {displayName}
                    </text>
                  </g>
                );
              }) : (
                // Estado vazio quando não há restaurantes
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  fill="#E5E7EB"
                  stroke="#D1D5DB"
                  strokeWidth="2"
                />
              )}
              
              {/* Círculo central vazio */}
              <circle
                cx="160"
                cy="160"
                r="60"
                fill="white"
                stroke="#F59E0B"
                strokeWidth="4"
              />
            </svg>
            
            {/* Indicador fixo */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
              <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-transparent border-t-amber-600 drop-shadow-lg"></div>
            </div>
            
            {/* Texto central */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center shadow-lg border-4 border-amber-500">
                <ChefHat className="h-8 w-8 text-amber-500" />
              </div>
            </div>
          </div>
          
          {/* Botão de girar */}
          <button
            onClick={handleSpin}
            disabled={spinning || availableCount === 0}
            className="px-8 py-3 bg-amber-500 text-white rounded-full font-bold text-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
          >
            {spinning ? (
              <>
                <RotateCcw className="h-5 w-5 animate-spin" />
                Girando...
              </>
            ) : (
              <>
                <RotateCcw className="h-5 w-5" />
                Girar Roleta
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Resultado */}
      {selectedRestaurant && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
            🎉 Restaurante Escolhido! 🎉
          </h3>
          <div className="max-w-md mx-auto">
            <RestaurantCard restaurant={selectedRestaurant} />
          </div>
          <div className="mt-4 text-center">
            <Link
              href={`/restaurants/${selectedRestaurant.id}`}
              className="inline-block px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
            >
              Ver Detalhes
            </Link>
          </div>
        </div>
      )}
      
      {loading && (
        <div className="text-center py-8 text-gray-500">
          Carregando restaurantes...
        </div>
      )}
    </div>
  );
};

export default RestaurantRoulette;
