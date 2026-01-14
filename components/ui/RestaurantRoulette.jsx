// components/ui/RestaurantRoulette.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/libs/supabase/client';
import { RotateCcw, ChefHat, Filter, X, Search, Plus, Check, Trash2 } from 'lucide-react';
import Link from 'next/link';
import RestaurantCard from './RestaurantCard';

const RestaurantRoulette = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filterNotVisited, setFilterNotVisited] = useState(false);
  const [selectedCuisineTypes, setSelectedCuisineTypes] = useState([]);
  const [cuisineTypes, setCuisineTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Seleção de restaurantes para roleta
  const [showRestaurantSelector, setShowRestaurantSelector] = useState(false);
  const [restaurantSearchQuery, setRestaurantSearchQuery] = useState('');
  const [availableRestaurants, setAvailableRestaurants] = useState([]);
  const [selectedRestaurantsForRoulette, setSelectedRestaurantsForRoulette] = useState([]);
  const [restaurantSelectorLoading, setRestaurantSelectorLoading] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(50);

  // Reset display limit when search changes
  useEffect(() => {
    setDisplayLimit(50);
  }, [restaurantSearchQuery]);
  
  const supabase = createClient();
  
  // Detectar tamanho da tela
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
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
  
  // Aplicar filtros e seleção de restaurantes
  useEffect(() => {
    let filtered = [...restaurants];

    // Se há restaurantes selecionados para a roleta, usar apenas esses
    if (selectedRestaurantsForRoulette.length > 0) {
      filtered = selectedRestaurantsForRoulette;
    } else {
      // Caso contrário, aplicar filtros normais
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
    }

    setFilteredRestaurants(filtered);
    setSelectedRestaurant(null);
  }, [restaurants, filterNotVisited, selectedCuisineTypes, selectedRestaurantsForRoulette]);
  
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
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 pb-6 sm:pb-8">
      {/* Header com Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
            <ChefHat className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-amber-500" />
            Roleta de Restaurantes
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowRestaurantSelector(true)}
              className="flex items-center justify-center px-4 py-2.5 sm:py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 active:from-amber-700 active:to-orange-700 transition-all duration-200 min-h-[44px] font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Selecionar Restaurantes
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-2.5 sm:py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 active:bg-amber-700 transition-colors min-h-[44px] font-medium"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </button>
          </div>
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
                  className="h-5 w-5 sm:h-4 sm:w-4 text-amber-500 focus:ring-amber-400 border-gray-300 rounded flex-shrink-0"
                />
                <label htmlFor="notVisitedFilter" className="text-sm font-medium text-gray-700 cursor-pointer">
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
                    className="w-full pl-8 pr-2 py-2 sm:py-1 border border-gray-300 rounded text-base sm:text-sm min-h-[44px] sm:min-h-0"
                  />
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                
                <div className="max-h-36 sm:max-h-36 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50">
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
              </div>
              
              <div className="flex justify-end pt-3 sm:pt-2 border-t border-gray-200">
                <button 
                  onClick={clearFilters}
                  className="px-5 py-2.5 sm:px-4 sm:py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center min-h-[44px] font-medium"
                >
                  <X className="h-4 w-4 mr-1.5 sm:mr-1" />
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Estatísticas */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          {selectedRestaurantsForRoulette.length > 0 && (
            <div className="mb-2">
              <p className="text-sm text-amber-600 font-medium">
                Usando seleção personalizada ({selectedRestaurantsForRoulette.length} restaurante{selectedRestaurantsForRoulette.length !== 1 ? 's' : ''})
              </p>
              <button
                onClick={() => setSelectedRestaurantsForRoulette([])}
                className="text-xs text-gray-500 hover:text-gray-700 underline mt-1"
              >
                Limpar seleção
              </button>
            </div>
          )}
          {availableCount > 0 ? (
            <p className="text-sm sm:text-base text-gray-600">
              <span className="font-semibold text-amber-600">{availableCount}</span> restaurante{availableCount !== 1 ? 's' : ''} disponível{availableCount !== 1 ? 'eis' : ''}
              {totalCount !== availableCount && (
                <span className="text-gray-500"> de {totalCount} total</span>
              )}
            </p>
          ) : (
            <p className="text-sm sm:text-base text-red-500 font-medium">
              Nenhum restaurante disponível com os filtros selecionados
            </p>
          )}
        </div>
      </div>
      
      {/* Roleta */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-[320px] sm:max-w-[360px] md:max-w-[400px] aspect-square mb-4 sm:mb-6">
            {/* SVG Roleta com nomes */}
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 320 320"
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="xMidYMid meet"
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
                // Reduzir innerRadius para dar mais espaço ao texto quando há muitos restaurantes
                const innerRadius = total > 20 ? 50 : total > 15 ? 55 : 60;
                
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
                // Rotação para que o texto fique vertical (radial, apontando para fora)
                const textRotation = (i + 0.5) * anglePerSlice - 90;
                
                // Ajustar tamanho da fonte baseado no número de restaurantes e tamanho da tela
                // Aumentar significativamente os tamanhos para melhor legibilidade, especialmente com muitos restaurantes
                const fontSize = isMobile 
                  ? (total <= 6 ? 16 : total <= 10 ? 14 : total <= 15 ? 13 : total <= 20 ? 12 : 11)
                  : (total <= 6 ? 20 : total <= 10 ? 18 : total <= 15 ? 16 : total <= 20 ? 14 : 13);
                const maxLength = isMobile
                  ? (total <= 6 ? 18 : total <= 10 ? 16 : total <= 15 ? 14 : total <= 20 ? 12 : 10)
                  : (total <= 6 ? 22 : total <= 10 ? 20 : total <= 15 ? 18 : total <= 20 ? 16 : 14);
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
                      stroke="rgba(0,0,0,0.7)"
                      strokeWidth="2"
                      fontWeight="bold"
                      style={{
                        textShadow: '3px 3px 6px rgba(0,0,0,0.9), 1px 1px 2px rgba(0,0,0,0.8)',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        letterSpacing: total > 20 ? '0.3px' : '0.5px',
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
              
              {/* Círculo central vazio - ajustar tamanho baseado no número de restaurantes */}
              <circle
                cx="160"
                cy="160"
                r={filteredRestaurants.length > 20 ? 50 : filteredRestaurants.length > 15 ? 55 : 60}
                fill="white"
                stroke="#F59E0B"
                strokeWidth="4"
              />
            </svg>
            
            {/* Indicador fixo */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 sm:-translate-y-2 z-10">
              <div className="w-0 h-0 border-l-[8px] sm:border-l-[12px] border-r-[8px] sm:border-r-[12px] border-t-[14px] sm:border-t-[20px] border-transparent border-t-amber-600 drop-shadow-lg"></div>
            </div>
            
            {/* Texto central */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className={`bg-white rounded-full flex items-center justify-center shadow-lg border-2 sm:border-4 border-amber-500 ${
                filteredRestaurants.length > 20 ? 'w-12 h-12 sm:w-20 sm:h-20' : 
                filteredRestaurants.length > 15 ? 'w-14 h-14 sm:w-22 sm:h-22' : 
                'w-16 h-16 sm:w-24 sm:h-24'
              }`}>
                <ChefHat className={`text-amber-500 ${
                  filteredRestaurants.length > 20 ? 'h-4 w-4 sm:h-6 sm:w-6' : 
                  filteredRestaurants.length > 15 ? 'h-5 w-5 sm:h-7 sm:w-7' : 
                  'h-5 w-5 sm:h-8 sm:w-8'
                }`} />
              </div>
            </div>
          </div>
          
          {/* Botão de girar */}
          <button
            onClick={handleSpin}
            disabled={spinning || availableCount === 0}
            className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-3 bg-amber-500 text-white rounded-full font-bold text-base sm:text-lg hover:bg-amber-600 active:bg-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg min-h-[52px] sm:min-h-[48px] disabled:hover:bg-amber-500"
          >
            {spinning ? (
              <>
                <RotateCcw className="h-5 w-5 animate-spin" />
                <span>Girando...</span>
              </>
            ) : (
              <>
                <RotateCcw className="h-5 w-5" />
                <span>Girar Roleta</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Resultado */}
      {selectedRestaurant && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
          <div className="text-center mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              🎉 Restaurante Escolhido! 🎉
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Este é o restaurante selecionado pela roleta
            </p>
          </div>
          
          {/* Container centralizado para o card */}
          <div className="flex justify-center items-center mb-5 sm:mb-6 px-2 sm:px-0">
            <div className="w-full max-w-md mx-auto min-w-0">
              <RestaurantCard restaurant={selectedRestaurant} centered={true} />
            </div>
          </div>
          
          {/* Botão de detalhes */}
          <div className="text-center">
            <Link
              href={`/restaurants/${selectedRestaurant.id}`}
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 sm:py-2.5 bg-amber-500 text-white rounded-md hover:bg-amber-600 active:bg-amber-700 transition-all min-h-[52px] sm:min-h-[48px] font-medium text-base shadow-md hover:shadow-lg"
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

      {/* Modal de seleção de restaurantes */}
      {showRestaurantSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-6 border-b border-amber-100">
              <div className="flex justify-between items-start sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-500 rounded-lg">
                      <ChefHat className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">Selecionar Restaurantes</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 ml-11">
                    Escolha os restaurantes que deseja incluir na roleta. Você pode buscar por nome.
                  </p>
                </div>
                <button
                  onClick={() => setShowRestaurantSelector(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors flex-shrink-0"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 flex flex-col max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
              {/* Barra de busca */}
              <div className="relative mb-3 sm:mb-4 flex-shrink-0">
                <input
                  type="text"
                  placeholder="Buscar restaurantes..."
                  value={restaurantSearchQuery}
                  onChange={(e) => setRestaurantSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base sm:text-sm min-h-[44px] sm:min-h-0"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>

              {/* Lista de restaurantes */}
              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-xl min-h-0 bg-gray-50/30">
                {(() => {
                  const filteredRestaurants = restaurants.filter(restaurant =>
                    restaurant.name.toLowerCase().includes(restaurantSearchQuery.toLowerCase())
                  );
                  const displayedRestaurants = filteredRestaurants.slice(0, displayLimit);

                  return (
                    <>
                      {displayedRestaurants.map(restaurant => {
                        const isSelected = selectedRestaurantsForRoulette.some(r => r.id === restaurant.id);
                        return (
                          <div
                            key={restaurant.id}
                            className={`flex items-center justify-between p-3 sm:p-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 cursor-pointer active:bg-amber-100 transition-all duration-200 min-h-[60px] sm:min-h-[56px] group ${
                              isSelected ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' : ''
                            }`}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedRestaurantsForRoulette(
                                  selectedRestaurantsForRoulette.filter(r => r.id !== restaurant.id)
                                );
                              } else {
                                setSelectedRestaurantsForRoulette([...selectedRestaurantsForRoulette, restaurant]);
                              }
                            }}
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                                isSelected
                                  ? 'bg-amber-500 border-amber-500 shadow-md'
                                  : 'border-gray-300 group-hover:border-amber-400 group-hover:shadow-sm'
                              }`}>
                                {isSelected && <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 text-sm sm:text-base truncate pr-2 group-hover:text-amber-900 transition-colors">
                                  {restaurant.name}
                                </div>
                                {restaurant.cuisine_types && restaurant.cuisine_types.length > 0 && (
                                  <div className="text-xs sm:text-sm text-gray-500 truncate flex items-center gap-1">
                                    <span className="inline-block w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                                    {restaurant.cuisine_types.map(type => type.name).join(', ')}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className={`text-xs sm:text-sm flex-shrink-0 ml-2 px-2 py-1 rounded-full font-medium ${
                              restaurant.visited
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {restaurant.visited ? 'Visitado' : 'Não Visitado'}
                            </div>
                          </div>
                        );
                      })}
                      {filteredRestaurants.length === 0 && (
                        <div className="text-center py-12 text-gray-500 text-sm sm:text-base">
                          <Search className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-300" />
                          <p>Nenhum restaurante encontrado</p>
                          <p className="text-xs text-gray-400 mt-1">Tente ajustar sua busca</p>
                        </div>
                      )}
                      {displayedRestaurants.length < filteredRestaurants.length && (
                        <div className="text-center p-4 border-t border-gray-100">
                          <button
                            onClick={() => setDisplayLimit(prev => prev + 50)}
                            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 active:bg-amber-700 transition-colors text-sm font-medium"
                          >
                            Carregar mais ({filteredRestaurants.length - displayedRestaurants.length} restantes)
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Restaurantes selecionados */}
              {selectedRestaurantsForRoulette.length > 0 && (
                <div className="mt-3 sm:mt-4 flex-shrink-0">
                  <h4 className="font-medium text-gray-700 mb-2 text-sm sm:text-base">
                    Selecionados ({selectedRestaurantsForRoulette.length}):
                  </h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-20 sm:max-h-24 overflow-y-auto">
                    {selectedRestaurantsForRoulette.map(restaurant => (
                      <div
                        key={restaurant.id}
                        className="inline-flex items-center bg-amber-100 text-amber-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                      >
                        <span className="truncate max-w-20 sm:max-w-32">{restaurant.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRestaurantsForRoulette(
                              selectedRestaurantsForRoulette.filter(r => r.id !== restaurant.id)
                            );
                          }}
                          className="ml-1 sm:ml-2 text-amber-600 hover:text-amber-800 flex-shrink-0"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 flex-shrink-0 bg-gray-50/50 -mx-4 sm:-mx-6 px-4 sm:px-6 -mb-4 sm:-mb-6 rounded-b-xl">
                <button
                  onClick={() => {
                    setSelectedRestaurantsForRoulette([]);
                    setShowRestaurantSelector(false);
                  }}
                  className="w-full sm:w-auto px-6 py-3 sm:py-2.5 text-sm sm:text-base text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 transition-all duration-200 min-h-[48px] sm:min-h-0 font-medium shadow-sm hover:shadow-md"
                >
                  Usar Todos
                </button>
                <button
                  onClick={() => setShowRestaurantSelector(false)}
                  className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 active:from-amber-700 active:to-orange-700 transition-all duration-200 text-sm sm:text-base min-h-[48px] sm:min-h-0 font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Check className="h-4 w-4 mr-2 inline" />
                  Confirmar ({selectedRestaurantsForRoulette.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantRoulette;
