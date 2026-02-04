// components/ui/RestaurantRoulette.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/libs/supabase/client';
import { useAuth } from '@/contexts';
import { RotateCcw, ChefHat, Filter, X, Search, Plus, Check, Sparkles, Apple, MapPin, Coffee, Wine, Utensils, Save, Clock, TrendingUp, Target, Zap, Star, Shield, Heart, ShieldCheck, Users, Calendar, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import RestaurantCard from '../RestaurantCard';
import { toast } from 'react-toastify';
import RouletteFilters from '../Filters/RouletteFilters';
import { useFiltersLogic } from '@/hooks/useFiltersLogic';
import type { RestaurantWithDetails, RestaurantVisitsData } from '@/libs/types';

interface FilterPreset {
  name: string;
  filters: any;
  timestamp: number;
}

interface SpinHistoryEntry {
  restaurant: RestaurantWithDetails;
  timestamp: number;
  filters: any;
}

const RestaurantRoulette = () => {
  const { user, getAccessToken } = useAuth();
  const [restaurants, setRestaurants] = useState<RestaurantWithDetails[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<RestaurantWithDetails[]>([]);
  const [visitsData, setVisitsData] = useState<RestaurantVisitsData>({});
  const [loading, setLoading] = useState(true);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantWithDetails | null>(null);
  const [rotation, setRotation] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Filtros - usando o sistema de filtros lógicos
  const [showFilters, setShowFilters] = useState(false);
  const [cuisineTypes, setCuisineTypes] = useState<any[]>([]);

  // Função para calcular innerRadius baseado no número de restaurantes      
  const getInnerRadius = (totalRestaurants: number) => {
    if (totalRestaurants <= 10) return 70;
    if (totalRestaurants <= 20) return 60;
    if (totalRestaurants <= 30) return 50;
    if (totalRestaurants <= 40) return 45;
    return 40; // Minimum inner radius for very large lists
  };

  // Seleção de restaurantes para roleta
  const [showRestaurantSelector, setShowRestaurantSelector] = useState(false);
  const [restaurantSearchQuery, setRestaurantSearchQuery] = useState('');
  const [selectedRestaurantsForRoulette, setSelectedRestaurantsForRoulette] = useState<RestaurantWithDetails[]>([]);
  const [displayLimit, setDisplayLimit] = useState(50);
  const resultRef = useRef<HTMLDivElement>(null);

  // Advanced features
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([]);
  const [showPresets, setShowPresets] = useState(false);
  const [lastSpinResult, setLastSpinResult] = useState<RestaurantWithDetails | null>(null);
  const [spinHistory, setSpinHistory] = useState<SpinHistoryEntry[]>([]);
  const [showSpinHistory, setShowSpinHistory] = useState(false);

  // Scroll to result when restaurant is selected
  useEffect(() => {
    if (selectedRestaurant && resultRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        if (resultRef.current) {
          resultRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }
  }, [selectedRestaurant]);

  const resetRestaurantSelector = () => {
    setRestaurantSearchQuery('');
    setSelectedRestaurantsForRoulette([]);
    setDisplayLimit(50);
  };

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

  // Iniciar animações quando o componente monta
  useEffect(() => {
    setIsVisible(true);
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
        const processedRestaurants = restaurantsData.map((restaurant: any) => ({
          ...restaurant,
          cuisine_types: restaurant.cuisine_types
            ? restaurant.cuisine_types.map((rel: any) => rel.cuisine_type)
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

  // Buscar dados de visitas para usuários autenticados
  useEffect(() => {
    const fetchVisitsData = async () => {
      if (!user || restaurants.length === 0) {
        return;
      }

      setLoadingVisits(true);
      try {
        const token = await getAccessToken();
        if (!token) {
          setLoadingVisits(false);
          return;
        }

        const restaurantIds = restaurants.map(r => r.id);

        const response = await fetch('/api/restaurants/visits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ restaurantIds }),
        });

        if (response.ok) {
          const data = await response.json();
          setVisitsData(data);
        } else {
          console.error('Failed to fetch visits data for roulette, status:', response.status);
        // Set default visits data on failure
          const defaultVisitsData: RestaurantVisitsData = {};
          restaurantIds.forEach(id => {
            defaultVisitsData[id] = { visited: false, visitCount: 0 };
          });
          setVisitsData(defaultVisitsData);
        }
      } catch (error) {
        console.error('Error fetching visits data for roulette:', error);
        // Set default visits data on error
        const defaultVisitsData: RestaurantVisitsData = {};
        restaurants.forEach(restaurant => {
          defaultVisitsData[restaurant.id] = { visited: false, visitCount: 0 };
        });
        setVisitsData(defaultVisitsData);
      } finally {
        setLoadingVisits(false);
      }
    };

    fetchVisitsData();
  }, [user, restaurants, getAccessToken]);
  
  // Usar o sistema de filtros lógicos
  const { filters, setFilters, filteredRestaurants: filteredRestaurantsFromLogic, activeFilters, clearFilters: clearFiltersLogic } = useFiltersLogic(restaurants, visitsData, user);
  
  // Atualizar filteredRestaurants com base na lógica de filtros
  useEffect(() => {
    let filtered = [...restaurants];

    // Se há restaurantes selecionados para a roleta, usar apenas esses
    if (selectedRestaurantsForRoulette.length > 0) {
      filtered = selectedRestaurantsForRoulette;
    } else {
      // Caso contrário, usar os filtros lógicos
      filtered = filteredRestaurantsFromLogic;
    }

    setFilteredRestaurants(filtered);
    setSelectedRestaurant(null);
  }, [restaurants, filteredRestaurantsFromLogic, selectedRestaurantsForRoulette, visitsData, user]);
  
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
  

  const handleToggleVisit = async (restaurantId: string) => {
    if (!user) {
      return;
    }

    try {
      const token = await getAccessToken();
      if (!token) {
        console.error('No access token available');
        return;
      }

      const response = await fetch(`/api/restaurants/${restaurantId}/visits`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'toggle_visited' }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle visit status');
      }

      const data = await response.json();

      // Update local visits data
      setVisitsData(prev => ({
        ...prev,
        [restaurantId]: {
          visited: data.visited,
          visitCount: data.visit_count
        }
      }));

      // Show success toast
      toast.success(
        data.visited
          ? 'Restaurante marcado como visitado!'
          : 'Restaurante marcado como não visitado!',
        {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
          className: "text-sm sm:text-base"
        }
      );
    } catch (err) {
      console.error('Erro ao alterar status de visita:', err);

      // Show error toast
      toast.error('Erro ao alterar status de visita. Tente novamente.', {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        className: "text-sm sm:text-base"
      });
    }
  };
  
  const availableCount = filteredRestaurants.length;
  const totalCount = restaurants.length;
  
  // Advanced features handlers
  const saveFilterPreset = useCallback((name: string) => {
    const preset: FilterPreset = {
      name,
      filters,
      timestamp: Date.now()
    };
    
    const savedPresets = JSON.parse(localStorage.getItem('rouletteFilterPresets') || '[]');
    savedPresets.push(preset);
    localStorage.setItem('rouletteFilterPresets', JSON.stringify(savedPresets));
    setFilterPresets(savedPresets);
    
    toast.success(`Filtro "${name}" salvo com sucesso!`, {
      position: "top-center",
      autoClose: 2000,
      theme: "light"
    });
  }, [filters]);

  const loadFilterPreset = useCallback((preset: FilterPreset) => {
    setFilters(preset.filters);
    setShowPresets(false);
    
    toast.success(`Filtro "${preset.name}" carregado!`, {
      position: "top-center",
      autoClose: 2000,
      theme: "light"
    });
  }, [setFilters]);

  const deleteFilterPreset = useCallback((presetName: string) => {
    const savedPresets = JSON.parse(localStorage.getItem('rouletteFilterPresets') || '[]');
    const updatedPresets = savedPresets.filter((p: FilterPreset) => p.name !== presetName);
    localStorage.setItem('rouletteFilterPresets', JSON.stringify(updatedPresets));
    setFilterPresets(updatedPresets);
    
    toast.success(`Filtro "${presetName}" excluído!`, {
      position: "top-center",
      autoClose: 2000,
      theme: "light"
    });
  }, []);

  const clearAllPresets = useCallback(() => {
    localStorage.removeItem('rouletteFilterPresets');
    setFilterPresets([]);
    setShowPresets(false);
    
    toast.success('Todos os filtros salvos foram excluídos!', {
      position: "top-center",
      autoClose: 2000,
      theme: "light"
    });
  }, []);

  const addToSpinHistory = useCallback((restaurant: RestaurantWithDetails) => {
    const newEntry: SpinHistoryEntry = {
      restaurant,
      timestamp: Date.now(),
      filters: { ...filters }
    };
    
    const history = JSON.parse(localStorage.getItem('rouletteSpinHistory') || '[]');
    history.unshift(newEntry);
    
    // Keep only last 20 spins
    if (history.length > 20) {
      history.length = 20;
    }
    
    localStorage.setItem('rouletteSpinHistory', JSON.stringify(history));
    setSpinHistory(history);
  }, [filters]);

  const clearSpinHistory = useCallback(() => {
    localStorage.removeItem('rouletteSpinHistory');
    setSpinHistory([]);
    setShowSpinHistory(false);
    
    toast.success('Histórico de roletas limpo!', {
      position: "top-center",
      autoClose: 2000,
      theme: "light"
    });
  }, []);

  // Load presets and history on mount
  useEffect(() => {
    const savedPresets = JSON.parse(localStorage.getItem('rouletteFilterPresets') || '[]');
    setFilterPresets(savedPresets);
    
    const savedHistory = JSON.parse(localStorage.getItem('rouletteSpinHistory') || '[]');
    setSpinHistory(savedHistory);
  }, []);

  // Add to history when a restaurant is selected
  useEffect(() => {
    if (selectedRestaurant) {
      addToSpinHistory(selectedRestaurant);
    }
  }, [selectedRestaurant, addToSpinHistory]);
  
  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 pb-6 sm:pb-8 relative overflow-hidden">
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
          </div>
        </div>
        
        {/* Filtros Tabbed */}
        <RouletteFilters
          filters={filters}
          setFilters={setFilters}
          clearFilters={clearFiltersLogic}
          autoApply={true}
        />
        
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
      <div className="bg-transparent rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 relative overflow-hidden">
        <div className="flex flex-col items-center relative z-10">
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
                transition: spinning ? 'transform 3s' : 'none',
              }}
            >
              <defs>
                {/* Gradientes para cada seção - usando o sistema de cores consistente */}
                {filteredRestaurants.map((_, i) => {
                  // Usar o sistema de cores do design: amber, orange, red, yellow, pink, purple, blue, green
                  const colors = [
                    '#F59E0B', // amber-500
                    '#F97316', // orange-500
                    '#EF4444', // red-500
                    '#EAB308', // yellow-500
                    '#EC4899', // pink-500
                    '#8B5CF6', // purple-500
                    '#3B82F6', // blue-500
                    '#10B981', // emerald-500
                    '#14B8A6', // teal-500
                    '#06B6D4', // cyan-500
                    '#F59E0B', // amber-500 (repetir para mais variações)
                    '#F97316', // orange-500
                    '#EF4444', // red-500
                    '#EAB308', // yellow-500
                    '#EC4899', // pink-500
                    '#8B5CF6', // purple-500
                    '#3B82F6', // blue-500
                    '#10B981', // emerald-500
                    '#14B8A6', // teal-500
                    '#06B6D4'  // cyan-500
                  ];
                  const color = colors[i % colors.length];
                  return (
                    <linearGradient key={i} id={`gradient-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={color} stopOpacity="1" />
                      <stop offset="100%" stopColor={color} stopOpacity="0.8" />
                    </linearGradient>
                  );
                })}
                
                {/* Gradiente para o indicador central */}
                <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="1" />
                  <stop offset="100%" stopColor="#F97316" stopOpacity="0.8" />
                </radialGradient>
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
                // Usar função responsável para calcular innerRadius
                const innerRadius = getInnerRadius(total);
                
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
                
                // Calcular posição do texto (meio da seção) - REMOVED since text is no longer displayed
                // const textAngle = ((i + 0.5) * anglePerSlice - 90) * (Math.PI / 180);
                // const textRadius = (radius + innerRadius) / 2;
                // const textX = centerX + textRadius * Math.cos(textAngle);
                // const textY = centerY + textRadius * Math.sin(textAngle);
                // Rotação para que o texto fique vertical (radial, apontando para fora)
                // const textRotation = (i + 0.5) * anglePerSlice - 90;
                
                return (
                  <g key={restaurant.id}>
                    <path
                      d={pathData}
                      fill={`url(#gradient-${i})`}
                      stroke="#fff"
                      strokeWidth="2"
                    />
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
              
              {/* Círculo central vazio - usar função responsável */}
              <circle
                cx="160"
                cy="160"
                r={getInnerRadius(filteredRestaurants.length)}
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
        <div ref={resultRef} className="bg-transparent rounded-xl p-4 sm:p-6 lg:p-8 border border-amber-100/50 relative overflow-hidden">
          {/* Elementos decorativos de fundo no resultado */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-4 left-4 w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
            <div className="absolute top-4 right-4 w-3 h-3 bg-orange-400 rounded-full animate-bounce animation-delay-300"></div>
            <div className="absolute bottom-4 left-4 w-3 h-3 bg-red-400 rounded-full animate-pulse animation-delay-600"></div>
            <div className="absolute bottom-4 right-4 w-3 h-3 bg-amber-500 rounded-full animate-bounce animation-delay-900"></div>
          </div>
          
          <div className="relative z-10 text-center mb-4 sm:mb-6">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-3 sm:mb-4 border border-amber-200/50 shadow-md">
              <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                🎉 Restaurante Escolhido! 🎉
              </h3>
              <Sparkles className="h-5 w-5 text-orange-500 animate-pulse" />
            </div>
            <p className="text-sm sm:text-base text-gray-600">
              Este é o restaurante selecionado pela roleta
            </p>
          </div>
          
          {/* Container centralizado para o card */}
          <div className="flex justify-center items-center mb-5 sm:mb-6 px-2 sm:px-0">
            <div className="w-full max-w-md mx-auto min-w-0 bg-transparent rounded-xl p-2 sm:p-3 border border-amber-100/50">
              <RestaurantCard
                restaurant={selectedRestaurant}
                centered={true}
                visitsData={visitsData[selectedRestaurant.id]}
                loadingVisits={loadingVisits}
                onVisitsDataUpdate={(restaurantId, newVisitsData) => {
                  setVisitsData(prev => ({
                    ...prev,
                    [restaurantId]: {
                      visited: newVisitsData.visited,
                      visitCount: newVisitsData.visit_count
                    }
                  }));
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {loading && (
        <div className="text-center py-8 text-gray-500">
          Carregando restaurantes...
        </div>
      )}

      {/* Modal de Presets de Filtros */}
      {showPresets && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-6 border-b border-amber-100">
              <div className="flex justify-between items-start sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-500 rounded-lg">
                      <Save className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">Presets de Filtros</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 ml-11">
                    Salve e carregue combinações de filtros para usar rapidamente.
                  </p>
                </div>
                <button
                  onClick={() => setShowPresets(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors flex-shrink-0"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 flex flex-col max-h-[calc(90vh-120px)]">
              {/* Salvar novo preset */}
              <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Salvar Filtro Atual</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nome do filtro..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling;
                      if (input && input instanceof HTMLInputElement && input.value.trim()) {
                        saveFilterPreset(input.value.trim());
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 active:bg-amber-700 transition-colors text-sm font-medium"
                  >
                    Salvar
                  </button>
                </div>
              </div>

              {/* Lista de presets */}
              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-xl min-h-0 bg-gray-50/30">
                {filterPresets.length > 0 ? (
                  filterPresets.map((preset, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 cursor-pointer active:bg-amber-100 transition-all duration-200 min-h-[60px] sm:min-h-[56px]"
                      onClick={() => loadFilterPreset(preset)}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Save className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {preset.name}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate">
                            {new Date(preset.timestamp).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            loadFilterPreset(preset);
                          }}
                          className="px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-medium hover:bg-amber-600 transition-colors"
                        >
                          Carregar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFilterPreset(preset.name);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500 text-sm sm:text-base">
                    <Save className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhum filtro salvo ainda</p>
                    <p className="text-xs text-gray-400 mt-1">Salve filtros para usar rapidamente</p>
                  </div>
                )}
              </div>

              {/* Ações */}
              {filterPresets.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-4 pt-4 border-t border-gray-200 flex-shrink-0 bg-gray-50/50 -mx-4 sm:-mx-6 px-4 sm:px-6 -mb-4 sm:-mb-6 rounded-b-xl">
                  <button
                    onClick={clearAllPresets}
                    className="w-full sm:w-auto px-4 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 active:bg-red-200 transition-all duration-200 font-medium"
                  >
                    Limpar Todos
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Histórico de Roletas */}
      {showSpinHistory && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-6 border-b border-amber-100">
              <div className="flex justify-between items-start sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-500 rounded-lg">
                      <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">Histórico de Roletas</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 ml-11">
                    Veja os últimos restaurantes selecionados e os filtros usados.
                  </p>
                </div>
                <button
                  onClick={() => setShowSpinHistory(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors flex-shrink-0"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 flex flex-col max-h-[calc(90vh-120px)]">
              {/* Lista de histórico */}
              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-xl min-h-0 bg-gray-50/30">
                {spinHistory.length > 0 ? (
                  spinHistory.map((entry, index) => (
                    <div
                      key={index}
                      className="p-3 sm:p-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <ChefHat className="h-4 w-4 text-amber-600" />
                            </div>
                            <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                              {entry.restaurant.name}
                            </div>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 mb-2">
                            {new Date(entry.timestamp).toLocaleString('pt-BR')}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {entry.filters.location?.city && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                {entry.filters.location.city}
                              </span>
                            )}
                            {(entry.filters.price_range?.min !== 0 || entry.filters.price_range?.max !== 100) && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                €{entry.filters.price_range.min} - €{entry.filters.price_range.max}
                              </span>
                            )}
                            {(entry.filters.rating_range?.min !== 0 || entry.filters.rating_range?.max !== 5) && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                {entry.filters.rating_range.min}★ - {entry.filters.rating_range.max}★
                              </span>
                            )}
                            {entry.filters.cuisine_types && entry.filters.cuisine_types.length > 0 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                {entry.filters.cuisine_types.length} culinárias
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <Link
                            href={`/restaurants/${entry.restaurant.id}`}
                            className="px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-medium hover:bg-amber-600 transition-colors"
                          >
                            Ver Perfil
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500 text-sm sm:text-base">
                    <Clock className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhum histórico ainda</p>
                    <p className="text-xs text-gray-400 mt-1">Gire a roleta para começar a registrar</p>
                  </div>
                )}
              </div>

              {/* Ações */}
              {spinHistory.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-4 pt-4 border-t border-gray-200 flex-shrink-0 bg-gray-50/50 -mx-4 sm:-mx-6 px-4 sm:px-6 -mb-4 sm:-mb-6 rounded-b-xl">
                  <button
                    onClick={clearSpinHistory}
                    className="w-full sm:w-auto px-4 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 active:bg-red-200 transition-all duration-200 font-medium"
                  >
                    Limpar Histórico
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de seleção de restaurantes */}
      {showRestaurantSelector && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
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
                  onClick={() => {
                    resetRestaurantSelector();
                    setShowRestaurantSelector(false);
                  }}
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
                  const filteredRestaurants = restaurants.filter(restaurant => {
                    // Robust null/undefined checks and type safety for restaurant name
                    const restaurantName = restaurant?.name;
                    if (!restaurantName || typeof restaurantName !== 'string') {
                      return false; // Skip restaurants with invalid names
                    }

                    // Robust null/undefined checks and type safety for search query
                    const searchQuery = restaurantSearchQuery?.trim();
                    if (!searchQuery) {
                      return true; // If no search query, include all valid restaurants
                    }

                    // Perform case-insensitive search with error handling
                    try {
                      return restaurantName.toLowerCase().includes(searchQuery.toLowerCase());
                    } catch (error) {
                      console.warn('Error filtering restaurant:', restaurant.id, error);
                      return false; // Skip on any filtering errors
                    }
                  });
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
                            <div className="text-xs sm:text-sm flex-shrink-0 ml-2 flex items-center gap-1">
                              {user ? (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleVisit(restaurant.id);
                                    }}
                                    disabled={loadingVisits}
                                    className={`px-2 py-1 rounded-full font-medium transition-all duration-200 ${
                                      visitsData[restaurant.id]?.visited
                                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    title={`Clique para marcar como ${visitsData[restaurant.id]?.visited ? 'não visitado' : 'visitado'}`}
                                  >
                                    {visitsData[restaurant.id]?.visited ? 'Visitado' : 'Não Visitado'}
                                  </button>
                                  {loadingVisits && (
                                    <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                  )}
                                </>
                              ) : (
                                <span className="px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-600">
                                  Status desconhecido
                                </span>
                              )}
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