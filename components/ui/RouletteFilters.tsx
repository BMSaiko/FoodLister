'use client';

import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Star, 
  Utensils, 
  Sparkles,
  Tag,
  Check,
  X as XIcon,
  DollarSign,
  Users
} from 'lucide-react';
import { createClient } from '@/libs/supabase/client';
import { RestaurantFeature, DietaryOption } from '@/libs/types';
import DualRangeSlider from './DualRangeSlider';
import { useAuth } from '@/contexts/index';

interface RouletteFiltersProps {
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

const RouletteFilters: React.FC<RouletteFiltersProps> = ({
  filters,
  setFilters,
  clearFilters,
  autoApply = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('location');
  const [features, setFeatures] = useState<RestaurantFeature[]>([]);
  const [dietaryOptions, setDietaryOptions] = useState<DietaryOption[]>([]);
  const [cuisineTypes, setCuisineTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationQuery, setLocationQuery] = useState('');
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const { user } = useAuth();
  const supabase = createClient();

  // Load features and dietary options
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load features via API
        const featuresResponse = await fetch('/api/features');
        if (featuresResponse.ok) {
          const featuresData = await featuresResponse.json();
          setFeatures(featuresData.data || []);
        } else {
          console.error('Failed to load features');
        }

        // Load dietary options via API
        const dietaryResponse = await fetch('/api/dietary-options');
        if (dietaryResponse.ok) {
          const dietaryData = await dietaryResponse.json();
          setDietaryOptions(dietaryData.data || []);
        } else {
          console.error('Failed to load dietary options');
        }

        // Load cuisine types via API
        const cuisineResponse = await fetch('/api/cuisine-types');
        if (cuisineResponse.ok) {
          const cuisineData = await cuisineResponse.json();
          setCuisineTypes(cuisineData.data || []);
        } else {
          console.error('Failed to load cuisine types');
        }
      } catch (err) {
        console.error('Error loading filter data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (filters.location?.city?.trim()) count++;
    if (filters.price_range?.min !== 0 || filters.price_range?.max !== 100) count++;
    if (filters.rating_range?.min !== 0 || filters.rating_range?.max !== 5) count++;
    if (filters.cuisine_types?.length > 0) count++;
    if (filters.features?.length > 0) count++;
    if (filters.dietary_options?.length > 0) count++;
    if (filters.visit_count?.min !== 0 || filters.visit_count?.max !== 100) count++;
    if (filters.visited || filters.not_visited) count++;
    
    setActiveFiltersCount(count);
  }, [filters]);

  const handleRangeChange = (field: string, value: number) => {
    setFilters((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultiSelect = (field: string, value: string) => {
    setFilters((prev: any) => {
      const current = prev[field] || [];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((item: string) => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const clearSpecificFilter = (field: string) => {
    if (field === 'location') {
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
  };

  const FilterChip: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
      {label}
      <button
        onClick={onRemove}
        className="ml-1.5 text-amber-600 hover:text-amber-800"
        aria-label="Remover filtro"
      >
        <XIcon className="h-3 w-3" />
      </button>
    </span>
  );

  const FilterTabButton: React.FC<{ 
    id: string; 
    title: string; 
    icon: React.ReactNode; 
    isActive: boolean; 
    onClick: () => void 
  }> = ({ id, title, icon, isActive, onClick }) => (
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
      className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
        isActive
          ? 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border border-amber-200/80 shadow-sm ring-2 ring-amber-200/50'
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50/80 hover:border-gray-200/60 border border-transparent'
      }`}
      aria-selected={isActive}
      role="tab"
      tabIndex={0}
      aria-controls={`tab-panel-${id}`}
    >
      <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150 ${
        isActive
          ? 'bg-amber-200/50 text-amber-700 shadow-md'
          : 'bg-gray-100/50 text-gray-500 group-hover:bg-gray-200/50'
      }`}>
        {icon}
      </div>
      <span className="font-medium">{title}</span>
      {id === 'location' && filters.location?.city?.trim() && (
        <span className="ml-2 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full" aria-label={`Filtro ativo: ${filters.location.city}`}>
          {filters.location.city}
        </span>
      )}
      {id === 'price-rating' && ((filters.price_range?.min !== 0 || filters.price_range?.max !== 100) || (filters.rating_range?.min !== 0 || filters.rating_range?.max !== 5)) && (
        <span className="ml-2 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full" aria-label="Filtros de preço e avaliação ativos">
          {((filters.price_range?.min !== 0 || filters.price_range?.max !== 100) ? '€' : '') + ((filters.rating_range?.min !== 0 || filters.rating_range?.max !== 5) ? '★' : '')}
        </span>
      )}
      {id === 'cuisine' && filters.cuisine_types && filters.cuisine_types.length > 0 && (
        <span className="ml-2 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full" aria-label={`Filtros de culinária ativos: ${filters.cuisine_types.length}`}>
          {filters.cuisine_types.length}
        </span>
      )}
      {id === 'features' && filters.features && filters.features.length > 0 && (
        <span className="ml-2 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full" aria-label={`Filtros de comodidades ativos: ${filters.features.length}`}>
          {filters.features.length}
        </span>
      )}
      {id === 'dietary' && filters.dietary_options && filters.dietary_options.length > 0 && (
        <span className="ml-2 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full" aria-label={`Filtros dietéticos ativos: ${filters.dietary_options.length}`}>
          {filters.dietary_options.length}
        </span>
      )}
    </button>
  );

  // Get available tabs based on authentication status (without search tab)
  const getAvailableTabs = () => {
    const baseTabs = [
      { id: 'location', title: 'Localização', icon: <MapPin className="h-4 w-4" /> },
      { id: 'price-rating', title: 'Preço & Avaliação', icon: <Star className="h-4 w-4" /> },
      { id: 'cuisine', title: 'Culinária', icon: <Utensils className="h-4 w-4" /> },
      { id: 'features', title: 'Comodidades', icon: <Sparkles className="h-4 w-4" /> },
      { id: 'dietary', title: 'Dietas', icon: <Tag className="h-4 w-4" /> }
    ];

    // Add visits tab only if user is logged in
    if (user) {
      baseTabs.push({ id: 'visits', title: 'Visitas', icon: <Users className="h-4 w-4" /> });
    }

    return baseTabs;
  };

  // Handle tab state management when tabs change due to authentication
  useEffect(() => {
    const availableTabs = getAvailableTabs();
    const availableTabIds = availableTabs.map(tab => tab.id);
    
    // If current active tab is not available, switch to the first available tab
    if (!availableTabIds.includes(activeTab)) {
      setActiveTab(availableTabIds[0] || 'location');
    }
  }, [user, activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'location':
        return (
          <div className="space-y-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Cidade ou bairro..."
                value={locationQuery}
                onChange={(e) => {
                  setLocationQuery(e.target.value);
                  setFilters((prev: any) => ({ 
                    ...prev, 
                    location: { ...prev.location, city: e.target.value }
                  }));
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Distância máxima (km)</label>
              <input
                type="range"
                min="1"
                max="100"
                value={filters.location?.distance || 50}
                onChange={(e) => handleRangeChange('location.distance', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 km</span>
                <span>{filters.location?.distance || 50} km</span>
                <span>100 km</span>
              </div>
            </div>
          </div>
        );

      case 'price-rating':
        return (
          <div className="space-y-8">
            {/* Price Range */}
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
              label="Faixa de Preço"
              unit="€"
            />
            
            {/* Rating Range */}
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
              label="Faixa de Avaliação"
              unit="★"
            />
          </div>
        );

      case 'cuisine':
        return (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-3 text-gray-500 text-sm bg-gray-50/50 rounded-lg border border-gray-200/60">
                <div className="animate-pulse flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 bg-amber-200 rounded-full animate-bounce"></div>
                  <span>Carregando opções...</span>
                </div>
              </div>
            ) : cuisineTypes.length === 0 ? (
              <div className="text-center py-3 text-gray-500 text-sm bg-gray-50/50 rounded-lg border border-gray-200/60">
                Nenhuma opção disponível
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto custom-scrollbar">
                {cuisineTypes.map((item) => {
                  const isSelected = filters.cuisine_types?.includes(item.id);
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMultiSelect('cuisine_types', item.id)}
                      className={`group flex items-center space-x-3 p-3 rounded-xl border transition-all duration-200 ${
                        isSelected 
                          ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 shadow-sm' 
                          : 'border-gray-200/60 hover:border-gray-300 hover:bg-gray-50/80 hover:shadow-md'
                      }`}
                      aria-pressed={isSelected}
                      aria-label={`Selecionar culinária ${item.name}`}
                    >
                      <div className={`flex items-center justify-center w-6 h-6 rounded-lg transition-colors duration-150 ${
                        isSelected 
                          ? 'bg-amber-500 text-white shadow-lg' 
                          : 'bg-gray-100/60 text-gray-700 group-hover:bg-gray-200/60 group-hover:text-gray-800'
                      }`}>
                        {isSelected ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <div className="w-4 h-4 rounded border-2 border-gray-400"></div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-800 group-hover:font-semibold group-hover:text-gray-900 transition-colors duration-150">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'features':
        return (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-3 text-gray-500 text-sm bg-gray-50/50 rounded-lg border border-gray-200/60">
                <div className="animate-pulse flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 bg-amber-200 rounded-full animate-bounce"></div>
                  <span>Carregando opções...</span>
                </div>
              </div>
            ) : features.length === 0 ? (
              <div className="text-center py-3 text-gray-500 text-sm bg-gray-50/50 rounded-lg border border-gray-200/60">
                Nenhuma opção disponível
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto custom-scrollbar">
                {features.map((item) => {
                  const isSelected = filters.features?.includes(item.id);
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMultiSelect('features', item.id)}
                      className={`group flex items-center space-x-3 p-3 rounded-xl border transition-all duration-200 ${
                        isSelected 
                          ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 shadow-sm' 
                          : 'border-gray-200/60 hover:border-gray-300 hover:bg-gray-50/80 hover:shadow-md'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-6 h-6 rounded-lg transition-colors duration-150 ${
                        isSelected 
                          ? 'bg-amber-500 text-white shadow-lg' 
                          : 'bg-gray-100/60 text-gray-700 group-hover:bg-gray-200/60 group-hover:text-gray-800'
                      }`}>
                        {isSelected ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <div className="w-4 h-4 rounded border-2 border-gray-400"></div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-800 group-hover:font-semibold group-hover:text-gray-900 transition-colors duration-150">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'dietary':
        return (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-3 text-gray-500 text-sm bg-gray-50/50 rounded-lg border border-gray-200/60">
                <div className="animate-pulse flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 bg-amber-200 rounded-full animate-bounce"></div>
                  <span>Carregando opções...</span>
                </div>
              </div>
            ) : dietaryOptions.length === 0 ? (
              <div className="text-center py-3 text-gray-500 text-sm bg-gray-50/50 rounded-lg border border-gray-200/60">
                Nenhuma opção disponível
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto custom-scrollbar">
                {dietaryOptions.map((item) => {
                  const isSelected = filters.dietary_options?.includes(item.id);
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMultiSelect('dietary_options', item.id)}
                      className={`group flex items-center space-x-3 p-3 rounded-xl border transition-all duration-200 ${
                        isSelected 
                          ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 shadow-sm' 
                          : 'border-gray-200/60 hover:border-gray-300 hover:bg-gray-50/80 hover:shadow-md'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-6 h-6 rounded-lg transition-colors duration-150 ${
                        isSelected 
                          ? 'bg-amber-500 text-white shadow-lg' 
                          : 'bg-gray-100/60 text-gray-700 group-hover:bg-gray-200/60 group-hover:text-gray-800'
                      }`}>
                        {isSelected ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <div className="w-4 h-4 rounded border-2 border-gray-400"></div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-800 group-hover:font-semibold group-hover:text-gray-900 transition-colors duration-150">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'visits':
        return (
          <div className="space-y-6">
            {/* Visit Status Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Status de Visita</label>
              
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
                        // Set default visit count range to show only visited restaurants
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
              >
                <option value="all">Todas as frequências</option>
                <option value="visited">Apenas Visitados</option>
                <option value="not_visited">Apenas não visitados</option>
              </select>
            </div>

            {/* Visit Frequency (only if "Apenas Visitados" is selected and user is logged in) */}
            {filters.visited && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Frequência de Visitas</label>
                
                <DualRangeSlider
                  min={1}
                  max={100}
                  step={1}
                  value={{
                    min: filters.visit_count?.min ?? 1,
                    max: filters.visit_count?.max ?? 100
                  }}
                  onChange={(value) => {
                    console.log('Visit count range changed:', value);
                    setFilters((prev: any) => ({
                      ...prev,
                      visit_count: value
                    }));
                  }}
                  label="Número de Visitas"
                  unit="vezes"
                />
                
                <div className="text-xs text-gray-500 bg-gray-50/50 px-3 py-2 rounded-lg border border-gray-200/60">
                  <span className="font-medium">Exemplo:</span> Se definir min=5, apenas restaurantes com 5 ou mais visitas serão exibidos
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 backdrop-blur-sm">
      {/* Filter Summary Bar */}
      <div className="border-b border-gray-100/50 bg-gradient-to-r from-amber-50/50 to-transparent">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors duration-150 group"
              aria-expanded={isOpen}
              aria-controls="filter-content"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-amber-100/80 rounded-xl group-hover:bg-amber-100 transition-colors duration-150">
                <Filter className="h-5 w-5 text-amber-600 group-hover:text-amber-700" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-sm text-gray-800">Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="ml-2 px-2.5 py-1 bg-amber-500 text-white text-xs font-medium rounded-full inline-flex items-center space-x-1">
                    <span>{activeFiltersCount}</span>
                    <span className="w-1.5 h-1.5 bg-white/30 rounded-full"></span>
                  </span>
                )}
              </div>
            </button>
            
            {/* Active Filters Chips */}
            <div className="flex flex-wrap gap-2 max-w-md">
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
          
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-3.5 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-150 group"
              >
                <X className="h-4 w-4 mr-2 text-amber-500 group-hover:text-amber-600" />
                <span className="text-amber-600 group-hover:text-amber-700">Limpar tudo</span>
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150 group"
              aria-label={isOpen ? "Fechar filtros" : "Abrir filtros"}
            >
              <div className="flex items-center justify-center w-6 h-6">
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-amber-500 group-hover:text-amber-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-amber-500 group-hover:text-amber-600" />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      {isOpen && (
        <div className="p-6" id="filter-content">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200/60 pb-4">
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

          {/* Tab Content */}
          <div className="border border-gray-200/60 rounded-xl p-5 bg-gradient-to-br from-gray-50/50 to-transparent">
            {renderTabContent()}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end items-center space-y-3 sm:space-y-0 sm:space-x-3 pt-5 border-t border-gray-100/60">
            {autoApply && (
              <div className="text-xs text-gray-500 flex items-center space-x-2 bg-gray-50/50 px-3 py-2 rounded-lg border border-gray-200/60">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                <span>Filtros aplicados automaticamente</span>
              </div>
            )}
            <div className="flex space-x-2">
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2.5 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 group"
              >
                <X className="h-4 w-4 mr-2.5 text-amber-500 group-hover:text-amber-600" />
                <span className="text-amber-600 group-hover:text-amber-700 font-medium">Limpar filtros</span>
              </button>
              {!autoApply && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-medium rounded-lg hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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

export default RouletteFilters;