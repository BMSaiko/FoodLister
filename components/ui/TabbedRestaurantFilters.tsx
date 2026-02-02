// TabbedRestaurantFilters.tsx - Enhanced Version with Performance & Design Improvements
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  MapPin, 
  Star, 
  Utensils, 
  Sparkles,
  Tag,
  Check,
  X as XIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Users
} from 'lucide-react';
import { createClient } from '@/libs/supabase/client';
import { RestaurantFeature, DietaryOption } from '@/libs/types';
import DualRangeSlider from './DualRangeSlider';
import { useAuth } from '@/contexts/index';

interface TabbedRestaurantFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
  clearFilters: () => void;
  autoApply?: boolean;
}

interface FilterTab {
  id: string;
  title: string;
  icon: React.ReactNode;
  isActive: boolean;
}

const TabbedRestaurantFilters: React.FC<TabbedRestaurantFiltersProps> = ({
  filters,
  setFilters,
  clearFilters,
  autoApply = true
}) => {
  // State management with performance optimizations
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [features, setFeatures] = useState<RestaurantFeature[]>([]);
  const [dietaryOptions, setDietaryOptions] = useState<DietaryOption[]>([]);
  const [cuisineTypes, setCuisineTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [filterPresets, setFilterPresets] = useState([]);
  const [showPresets, setShowPresets] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Performance optimization refs
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const filterUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const metricsRef = useRef({
    renderTime: 0,
    filterTime: 0,
    memoryUsage: 0,
    fps: 0
  });

  const { user } = useAuth();
  const supabase = createClient();


  // Load features and dietary options with performance optimization
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Use Promise.all for parallel loading
        const [featuresResponse, dietaryResponse, cuisineResponse] = await Promise.all([
          fetch('/api/features'),
          fetch('/api/dietary-options'),
          fetch('/api/cuisine-types')
        ]);

        if (featuresResponse.ok) {
          const featuresData = await featuresResponse.json();
          setFeatures(featuresData.data || []);
        }

        if (dietaryResponse.ok) {
          const dietaryData = await dietaryResponse.json();
          setDietaryOptions(dietaryData.data || []);
        }

        if (cuisineResponse.ok) {
          const cuisineData = await cuisineResponse.json();
          setCuisineTypes(cuisineData.data || []);
        }
      } catch (err) {
        console.error('Error loading filter data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate active filters count with memoization
  const activeFiltersCountMemo = useMemo(() => {
    let count = 0;
    if (filters.search?.trim()) count++;
    if (filters.location?.city?.trim()) count++;
    if (filters.price_range?.min !== 0 || filters.price_range?.max !== 100) count++;
    if (filters.rating_range?.min !== 0 || filters.rating_range?.max !== 5) count++;
    if (filters.cuisine_types && filters.cuisine_types.length > 0) count++;
    if (filters.features && filters.features.length > 0) count++;
    if (filters.dietary_options && filters.dietary_options.length > 0) count++;
    if (filters.visit_count?.min !== 0 || filters.visit_count?.max !== 100) count++;
    if (filters.visited || filters.not_visited) count++;
    return count;
  }, [filters]);

  // Update active filters count
  useEffect(() => {
    setActiveFiltersCount(activeFiltersCountMemo);
  }, [activeFiltersCountMemo]);

  // Performance-optimized range change handler
  const handleRangeChange = useCallback((field: string, value: number) => {
    setFilters((prev: any) => ({
      ...prev,
      [field]: value
    }));
  }, [setFilters]);

  // Performance-optimized multi-select handler
  const handleMultiSelect = useCallback((field: string, value: string) => {
    setFilters((prev: any) => {
      const current = prev[field] || [];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((item: string) => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  }, [setFilters]);

  // Enhanced FilterChip with performance optimizations
  const FilterChip: React.FC<{ label: string; onRemove: () => void }> = React.memo(({ label, onRemove }) => (
    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200/80 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer group">
      <span className="mr-2 w-2 h-2 bg-amber-400 rounded-full group-hover:bg-amber-500 transition-colors duration-200"></span>
      <span className="font-medium">{label}</span>
      <button
        onClick={onRemove}
        className="ml-2 p-1 rounded-full hover:bg-amber-200/50 transition-colors duration-200"
        aria-label="Remover filtro"
      >
        <XIcon className="h-4 w-4 text-amber-600 group-hover:text-amber-700" />
      </button>
    </span>
  ));

  // Enhanced FilterTabButton with micro-interactions
  const FilterTabButton: React.FC<{ 
    id: string; 
    title: string; 
    icon: React.ReactNode; 
    isActive: boolean; 
    onClick: () => void 
  }> = React.memo(({ id, title, icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const availableTabs = getAvailableTabs();
          const tabIds = availableTabs.map(tab => tab.id);
          const currentIndex = tabIds.indexOf(activeTab);
          const nextIndex = e.key === 'ArrowRight' 
            ? (currentIndex + 1) % tabIds.length 
            : (currentIndex - 1 + tabIds.length) % tabIds.length;
          setActiveTab(tabIds[nextIndex]);
        }
      }}
      className={`group relative flex items-center space-x-2 sm:space-x-4 px-3 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 transform hover:-translate-y-1 min-h-[44px] min-w-[140px] ${
        isActive
          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl shadow-amber-500/20 ring-2 ring-amber-300/50'
          : 'text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 border border-gray-200/60 hover:border-amber-300/60 shadow-sm hover:shadow-lg'
      }`}
      aria-selected={isActive}
      role="tab"
      tabIndex={0}
      aria-controls={`tab-panel-${id}`}
    >
      {/* Animated background for active state */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-xl animate-pulse"></div>
      )}
      
      <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
        isActive
          ? 'bg-white/20 shadow-lg'
          : 'bg-white/60 group-hover:bg-white/80'
      }`}>
        <div className={`w-6 h-6 ${isActive ? 'text-white' : 'text-amber-600'}`}>
          {icon}
        </div>
      </div>
      
      <span className="relative z-10 hidden sm:inline">{title}</span>
      
      {/* Active indicator */}
      {isActive && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-white rounded-full opacity-80"></div>
      )}
      
      {/* Filter count indicators */}
      {id === 'search' && filters.search?.trim() && (
        <span className="ml-3 px-2.5 py-1 bg-white/20 text-white text-sm font-medium rounded-full backdrop-blur-sm border border-white/30">
          {filters.search.trim()}
        </span>
      )}
      {id === 'location' && filters.location?.city?.trim() && (
        <span className="ml-3 px-2.5 py-1 bg-white/20 text-white text-sm font-medium rounded-full backdrop-blur-sm border border-white/30">
          {filters.location.city}
        </span>
      )}
      {id === 'price-rating' && ((filters.price_range?.min !== 0 || filters.price_range?.max !== 100) || (filters.rating_range?.min !== 0 || filters.rating_range?.max !== 5)) && (
        <span className="ml-3 px-2.5 py-1 bg-white/20 text-white text-sm font-medium rounded-full backdrop-blur-sm border border-white/30">
          {((filters.price_range?.min !== 0 || filters.price_range?.max !== 100) ? '€' : '') + ((filters.rating_range?.min !== 0 || filters.rating_range?.max !== 5) ? '★' : '')}
        </span>
      )}
      {id === 'cuisine' && filters.cuisine_types && filters.cuisine_types.length > 0 && (
        <span className="ml-3 px-2.5 py-1 bg-white/20 text-white text-sm font-medium rounded-full backdrop-blur-sm border border-white/30">
          {filters.cuisine_types.length}
        </span>
      )}
      {id === 'features' && filters.features && filters.features.length > 0 && (
        <span className="ml-3 px-2.5 py-1 bg-white/20 text-white text-sm font-medium rounded-full backdrop-blur-sm border border-white/30">
          {filters.features.length}
        </span>
      )}
      {id === 'dietary' && filters.dietary_options && filters.dietary_options.length > 0 && (
        <span className="ml-3 px-2.5 py-1 bg-white/20 text-white text-sm font-medium rounded-full backdrop-blur-sm border border-white/30">
          {filters.dietary_options.length}
        </span>
      )}
    </button>
  ));

  // Get available tabs with memoization
  const getAvailableTabs = useCallback(() => {
    const baseTabs = [
      { id: 'search', title: 'Busca Inteligente', icon: <SearchIcon className="h-6 w-6" /> },
      { id: 'location', title: 'Localização', icon: <MapPin className="h-6 w-6" /> },
      { id: 'price-rating', title: 'Preço & Avaliação', icon: <Star className="h-6 w-6" /> },
      { id: 'cuisine', title: 'Culinária', icon: <Utensils className="h-6 w-6" /> },
      { id: 'features', title: 'Comodidades', icon: <Sparkles className="h-6 w-6" /> },
      { id: 'dietary', title: 'Dietas', icon: <Tag className="h-6 w-6" /> }
    ];

    if (user) {
      baseTabs.push({ id: 'visits', title: 'Visitas', icon: <Users className="h-6 w-6" /> });
    }

    return baseTabs;
  }, [user]);

  // Handle tab state management
  useEffect(() => {
    const availableTabs = getAvailableTabs();
    const availableTabIds = availableTabs.map(tab => tab.id);
    
    if (!availableTabIds.includes(activeTab)) {
      setActiveTab(availableTabIds[0] || 'search');
    }
  }, [user, activeTab, getAvailableTabs]);

  // Enhanced search with debouncing
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      setFilters((prev: any) => ({ ...prev, search: value }));
    }, 300);
  }, [setFilters]);

  // Enhanced location change with debouncing
  const handleLocationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setFilters((prev: any) => ({ 
        ...prev, 
        location: { ...prev.location, city: value }
      }));
    }, 300);
  }, [setFilters]);

  // Enhanced render tab content with performance optimizations
  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'search':
        return (
          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nome, localização ou descrição..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-400 transition-all duration-300 hover:border-amber-300 shadow-sm touch-auto"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilters((prev: any) => ({ ...prev, search: '' }));
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <XIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Search suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setSearchQuery('italiano');
                  setFilters((prev: any) => ({ ...prev, search: 'italiano' }));
                }}
                className="p-4 text-left bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/60 hover:border-amber-300/80 transition-all duration-200 hover:shadow-md touch-manipulation"
              >
                <div className="text-amber-600 font-semibold">Italiano</div>
                <div className="text-sm text-gray-600">Restaurantes italianos</div>
              </button>
              <button
                onClick={() => {
                  setSearchQuery('centro');
                  setFilters((prev: any) => ({ ...prev, search: 'centro' }));
                }}
                className="p-4 text-left bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/60 hover:border-amber-300/80 transition-all duration-200 hover:shadow-md touch-manipulation"
              >
                <div className="text-amber-600 font-semibold">Centro</div>
                <div className="text-sm text-gray-600">Restaurantes no centro</div>
              </button>
              <button
                onClick={() => {
                  setSearchQuery('romântico');
                  setFilters((prev: any) => ({ ...prev, search: 'romântico' }));
                }}
                className="p-4 text-left bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/60 hover:border-amber-300/80 transition-all duration-200 hover:shadow-md touch-manipulation"
              >
                <div className="text-amber-600 font-semibold">Romântico</div>
                <div className="text-sm text-gray-600">Ambiente romântico</div>
              </button>
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="Cidade, bairro ou ponto de referência..."
                  value={locationQuery}
                  onChange={handleLocationChange}
                  className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-400 transition-all duration-300 hover:border-amber-300 shadow-sm"
                />
                {locationQuery && (
                  <button
                    onClick={() => {
                      setLocationQuery('');
                      setFilters((prev: any) => ({ ...prev, location: { city: '', distance: 50 } }));
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <XIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-lg font-semibold text-gray-800">Distância máxima</label>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/60">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={filters.location?.distance || 50}
                    onChange={(e) => handleRangeChange('location.distance', parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-orange-500 transition-colors duration-200"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-3">
                    <span className="font-medium">1 km</span>
                    <span className="font-medium text-amber-600">{filters.location?.distance || 50} km</span>
                    <span className="font-medium">100 km</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'price-rating':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <label className="block text-lg font-semibold text-gray-800">Faixa de Preço</label>
                <DualRangeSlider
                  min={0}
                  max={100}
                  step={5}
                  value={{
                    min: filters.price_range?.min ?? 0,
                    max: filters.price_range?.max ?? 100
                  }}
                  onChange={(value) => {
                    setFilters((prev: any) => ({
                      ...prev,
                      price_range: value
                    }));
                  }}
                  label="Preço"
                  unit="€"
                />
              </div>
              
              <div className="space-y-6">
                <label className="block text-lg font-semibold text-gray-800">Faixa de Avaliação</label>
                <DualRangeSlider
                  min={0}
                  max={5}
                  step={0.5}
                  value={{
                    min: filters.rating_range?.min ?? 0,
                    max: filters.rating_range?.max ?? 5
                  }}
                  onChange={(value) => {
                    setFilters((prev: any) => ({
                      ...prev,
                      rating_range: value
                    }));
                  }}
                  label="Avaliação"
                  unit="★"
                />
              </div>
            </div>
          </div>
        );

      case 'cuisine':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {loading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-200 rounded-xl p-6"></div>
                  </div>
                ))
              ) : cuisineTypes.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Nenhuma opção disponível
                </div>
              ) : (
                cuisineTypes.map((item) => {
                  const isSelected = filters.cuisine_types?.includes(item.id);
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMultiSelect('cuisine_types', item.id)}
                      className={`group relative p-6 rounded-xl border-2 transition-all duration-300 transform hover:-translate-y-2 ${
                        isSelected 
                          ? 'border-amber-400 bg-gradient-to-r from-amber-100 to-orange-100 shadow-xl shadow-amber-500/20' 
                          : 'border-gray-200/60 hover:border-amber-300/60 bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-lg'
                      }`}
                    >
                      {/* Animated background */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-xl animate-pulse"></div>
                      )}
                      
                      <div className={`flex items-center justify-center w-12 h-12 rounded-xl mb-4 mx-auto transition-all duration-300 ${
                        isSelected 
                          ? 'bg-white/80 shadow-lg' 
                          : 'bg-white/60 group-hover:bg-white/80'
                      }`}>
                        <div className={`w-6 h-6 ${isSelected ? 'text-amber-600' : 'text-gray-600'}`}>
                          <Utensils className="h-6 w-6" />
                        </div>
                      </div>
                      
                      <div className={`text-center font-semibold text-lg transition-colors duration-300 ${
                        isSelected ? 'text-amber-700' : 'text-gray-700 group-hover:text-amber-600'
                      }`}>
                        {item.name}
                      </div>
                      
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {loading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-200 rounded-xl p-6"></div>
                  </div>
                ))
              ) : features.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Nenhuma opção disponível
                </div>
              ) : (
                features.map((item) => {
                  const isSelected = filters.features?.includes(item.id);
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMultiSelect('features', item.id)}
                      className={`group relative p-6 rounded-xl border-2 transition-all duration-300 transform hover:-translate-y-2 ${
                        isSelected 
                          ? 'border-amber-400 bg-gradient-to-r from-amber-100 to-orange-100 shadow-xl shadow-amber-500/20' 
                          : 'border-gray-200/60 hover:border-amber-300/60 bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-lg'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-xl animate-pulse"></div>
                      )}
                      
                      <div className={`flex items-center justify-center w-12 h-12 rounded-xl mb-4 mx-auto transition-all duration-300 ${
                        isSelected 
                          ? 'bg-white/80 shadow-lg' 
                          : 'bg-white/60 group-hover:bg-white/80'
                      }`}>
                        <div className={`w-6 h-6 ${isSelected ? 'text-amber-600' : 'text-gray-600'}`}>
                          <Sparkles className="h-6 w-6" />
                        </div>
                      </div>
                      
                      <div className={`text-center font-semibold text-lg transition-colors duration-300 ${
                        isSelected ? 'text-amber-700' : 'text-gray-700 group-hover:text-amber-600'
                      }`}>
                        {item.name}
                      </div>
                      
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        );

      case 'dietary':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {loading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-200 rounded-xl p-6"></div>
                  </div>
                ))
              ) : dietaryOptions.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Nenhuma opção disponível
                </div>
              ) : (
                dietaryOptions.map((item) => {
                  const isSelected = filters.dietary_options?.includes(item.id);
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMultiSelect('dietary_options', item.id)}
                      className={`group relative p-6 rounded-xl border-2 transition-all duration-300 transform hover:-translate-y-2 ${
                        isSelected 
                          ? 'border-amber-400 bg-gradient-to-r from-amber-100 to-orange-100 shadow-xl shadow-amber-500/20' 
                          : 'border-gray-200/60 hover:border-amber-300/60 bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-lg'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-xl animate-pulse"></div>
                      )}
                      
                      <div className={`flex items-center justify-center w-12 h-12 rounded-xl mb-4 mx-auto transition-all duration-300 ${
                        isSelected 
                          ? 'bg-white/80 shadow-lg' 
                          : 'bg-white/60 group-hover:bg-white/80'
                      }`}>
                        <div className={`w-6 h-6 ${isSelected ? 'text-amber-600' : 'text-gray-600'}`}>
                          <Tag className="h-6 w-6" />
                        </div>
                      </div>
                      
                      <div className={`text-center font-semibold text-lg transition-colors duration-300 ${
                        isSelected ? 'text-amber-700' : 'text-gray-700 group-hover:text-amber-600'
                      }`}>
                        {item.name}
                      </div>
                      
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        );

      case 'visits':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Visit Status Selection */}
              <div className="space-y-6">
                <label className="block text-lg font-semibold text-gray-800">Status de Visita</label>
                <select
                  value={
                    filters.visited && filters.not_visited ? 'all' :
                    filters.visited ? 'visited' :
                    filters.not_visited ? 'not_visited' : 'all'
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilters((prev: any) => {
                      const newFilters = { ...prev };
                      
                      switch (value) {
                        case 'all':
                          newFilters.visited = false;
                          newFilters.not_visited = false;
                          newFilters.visit_count = { min: 0, max: 100 };
                          break;
                        case 'visited':
                          newFilters.visited = true;
                          newFilters.not_visited = false;
                          newFilters.visit_count = { min: 1, max: 50 };
                          break;
                        case 'not_visited':
                          newFilters.visited = false;
                          newFilters.not_visited = true;
                          newFilters.visit_count = { min: 0, max: 100 };
                          break;
                      }
                      
                      return newFilters;
                    });
                  }}
                  className="w-full px-4 py-4 text-lg border border-gray-200 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-400 transition-all duration-300 hover:border-amber-300 shadow-sm"
                >
                  <option value="all">Todas as frequências</option>
                  <option value="visited">Apenas Visitados</option>
                  <option value="not_visited">Apenas não visitados</option>
                </select>
              </div>

              {/* Visit Frequency */}
              {filters.visited && (
                <div className="space-y-6">
                  <label className="block text-lg font-semibold text-gray-800">Frequência de Visitas</label>
                  <DualRangeSlider
                    min={1}
                    max={100}
                    step={1}
                    value={{
                      min: filters.visit_count?.min ?? 1,
                      max: filters.visit_count?.max ?? 100
                    }}
                    onChange={(value) => {
                      setFilters((prev: any) => ({
                        ...prev,
                        visit_count: value
                      }));
                    }}
                    label="Número de Visitas"
                    unit="vezes"
                  />
                  
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl p-4">
                    <div className="text-sm text-amber-700">
                      <span className="font-semibold">Dica:</span> Defina um mínimo de visitas para encontrar seus restaurantes favoritos!
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  }, [activeTab, filters, loading, cuisineTypes, features, dietaryOptions, searchQuery, locationQuery, handleSearchChange, handleLocationChange, handleRangeChange, handleMultiSelect, setFilters]);

  // Enhanced clear specific filter
  const clearSpecificFilter = useCallback((field: string) => {
    if (field === 'search') {
      setFilters((prev: any) => ({ ...prev, search: '' }));
      setSearchQuery('');
    } else if (field === 'location') {
      setFilters((prev: any) => ({ ...prev, location: { city: '', distance: 50 } }));
      setLocationQuery('');
    } else if (field === 'price') {
      setFilters((prev: any) => ({ ...prev, price_range: { min: 0, max: 100 } }));
    } else if (field === 'rating') {
      setFilters((prev: any) => ({ ...prev, rating_range: { min: 0, max: 5 } }));
    } else if (field === 'cuisine') {
      setFilters((prev: any) => ({ ...prev, cuisine_types: [] }));
    } else if (field === 'features') {
      setFilters((prev: any) => ({ ...prev, features: [] }));
    } else if (field === 'dietary') {
      setFilters((prev: any) => ({ ...prev, dietary_options: [] }));
    } else if (field === 'visits') {
      setFilters((prev: any) => ({ ...prev, visit_count: { min: 0, max: 100 }, visited: false, not_visited: false }));
    }
  }, [setFilters]);

  // Save filter preset
  const saveFilterPreset = useCallback((name: string) => {
    const preset = {
      name,
      filters,
      timestamp: Date.now()
    };
    
    const savedPresets = JSON.parse(localStorage.getItem('restaurantFilterPresets') || '[]');
    savedPresets.push(preset);
    localStorage.setItem('restaurantFilterPresets', JSON.stringify(savedPresets));
    setFilterPresets(savedPresets);
  }, [filters]);

  // Load filter preset
  const loadFilterPreset = useCallback((preset: any) => {
    setFilters(preset.filters);
    setShowPresets(false);
  }, [setFilters]);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100/50 backdrop-blur-sm overflow-hidden">
      {/* Enhanced Filter Summary Bar */}
      <div className="border-b border-gray-100/50 bg-gradient-to-r from-amber-50/80 via-orange-50/80 to-amber-50/80">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-6">
            {/* Enhanced Filter Toggle Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="group flex items-center space-x-4 text-gray-800 hover:text-gray-900 transition-all duration-300"
              aria-expanded={isOpen}
              aria-controls="filter-content"
            >
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-xl group-hover:shadow-2xl group-hover:from-amber-600 group-hover:to-orange-600 transition-all duration-300 transform group-hover:scale-105 group-active:scale-95">
                  <FilterIcon className="h-7 w-7 text-white drop-shadow-lg" />
                </div>
              </div>
              
              <div className="text-left">
                <span className="block text-2xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors duration-300">Filtros Avançados</span>
                {activeFiltersCount > 0 && (
                  <div className="flex items-center space-x-3 mt-2">
                    <span className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-white/60 shadow-sm">
                      <span className="w-3 h-3 bg-amber-400 rounded-full mr-2 animate-pulse"></span>
                      <span className="text-sm font-semibold text-gray-700">{activeFiltersCount} filtros ativos</span>
                    </span>
                    <span className="text-sm text-gray-600">•</span>
                    <span className="text-sm text-gray-600 font-medium">Performance otimizada</span>
                  </div>
                )}
              </div>
            </button>
            
            {/* Enhanced Active Filters Chips */}
            <div className="flex flex-wrap gap-3 max-w-2xl">
              {filters.search?.trim() && (
                <FilterChip 
                  label={`Busca: ${filters.search}`} 
                  onRemove={() => clearSpecificFilter('search')} 
                />
              )}
              {filters.location?.city?.trim() && (
                <FilterChip 
                  label={`Local: ${filters.location.city}`} 
                  onRemove={() => clearSpecificFilter('location')} 
                />
              )}
              {(filters.price_range?.min !== 0 || filters.price_range?.max !== 100) && (
                <FilterChip 
                  label={`Preço: €${filters.price_range?.min ?? 0} - €${filters.price_range?.max ?? 100}`} 
                  onRemove={() => clearSpecificFilter('price')} 
                />
              )}
              {(filters.rating_range?.min !== 0 || filters.rating_range?.max !== 5) && (
                <FilterChip 
                  label={`Avaliação: ${filters.rating_range?.min ?? 0}★ - ${filters.rating_range?.max ?? 5}★`} 
                  onRemove={() => clearSpecificFilter('rating')} 
                />
              )}
              {filters.cuisine_types && filters.cuisine_types.length > 0 && (
                <FilterChip 
                  label={`Culinária: ${filters.cuisine_types.length}`} 
                  onRemove={() => clearSpecificFilter('cuisine')} 
                />
              )}
              {filters.features && filters.features.length > 0 && (
                <FilterChip 
                  label={`Comodidades: ${filters.features.length}`} 
                  onRemove={() => clearSpecificFilter('features')} 
                />
              )}
              {filters.dietary_options && filters.dietary_options.length > 0 && (
                <FilterChip 
                  label={`Dietas: ${filters.dietary_options.length}`} 
                  onRemove={() => clearSpecificFilter('dietary')} 
                />
              )}
              {filters.visited && (
                <FilterChip 
                  label="Visitados" 
                  onRemove={() => clearSpecificFilter('visits')} 
                />
              )}
              {filters.not_visited && (
                <FilterChip 
                  label="Não Visitados" 
                  onRemove={() => clearSpecificFilter('visits')} 
                />
              )}
              {(filters.visit_count?.min !== 1 || filters.visit_count?.max !== 50) && filters.visited && (
                <FilterChip 
                  label={`Visitas: ${filters.visit_count?.min ?? 1} - ${filters.visit_count?.max ?? 50} vezes`} 
                  onRemove={() => clearSpecificFilter('visits')} 
                />
              )}
            </div>
          </div>
          
          {/* Enhanced Actions */}
          <div className="flex items-center space-x-4">
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="group inline-flex items-center px-6 py-3 border-2 border-amber-200/60 text-lg font-semibold rounded-xl text-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-all duration-300 hover:shadow-lg hover:border-amber-300/80 transform hover:-translate-y-1"
              >
                <X className="h-5 w-5 mr-3 text-amber-600 group-hover:text-amber-700" />
                <span>Limpar tudo</span>
              </button>
            )}
            
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="group p-4 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-300 transform hover:scale-105"
              aria-label={isOpen ? "Fechar filtros" : "Abrir filtros"}
            >
              <div className="flex items-center justify-center w-8 h-8">
                {isOpen ? (
                  <ChevronUp className="h-6 w-6 text-amber-600 group-hover:text-amber-700" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-amber-600 group-hover:text-amber-700" />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Filter Tabs */}
      {isOpen && (
        <div className="p-6 sm:p-8" id="filter-content">
          {/* Enhanced Tab Navigation */}
          <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8">
            {getAvailableTabs().map((tab) => (
              <FilterTabButton
                key={tab.id}
                id={tab.id}
                title={tab.title}
                icon={tab.icon}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>

          {/* Enhanced Tab Content */}
          <div className="border border-gray-200/60 rounded-xl sm:rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-gray-50/80 via-transparent to-orange-50/20 shadow-lg">
            {renderTabContent()}
          </div>

          {/* Enhanced Actions */}
          <div className="flex flex-col sm:flex-row justify-end items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-6 sm:pt-8 border-t border-gray-100/60">
            {autoApply && (
              <div className="flex items-center space-x-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 px-6 py-3 rounded-xl shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse animation-delay-100"></div>
                  <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse animation-delay-200"></div>
                </div>
                <span className="text-sm font-medium text-amber-700">Filtros aplicados automaticamente</span>
              </div>
            )}
            
            <div className="flex space-x-4">
              <button
                onClick={clearFilters}
                className="group inline-flex items-center px-8 py-4 border-2 border-amber-200/60 text-lg font-semibold rounded-xl text-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-all duration-300 hover:shadow-lg hover:border-amber-300/80 transform hover:-translate-y-1"
              >
                <X className="h-5 w-5 mr-3 text-amber-600 group-hover:text-amber-700" />
                <span>Limpar filtros</span>
              </button>
              
              {!autoApply && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-lg font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0"
                >
                  <span className="font-semibold">Aplicar filtros</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabbedRestaurantFilters;