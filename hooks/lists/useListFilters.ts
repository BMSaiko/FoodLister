// hooks/lists/useListFilters.ts
import { useState, useEffect } from 'react';
import { createClient } from '@/libs/supabase/client';

export interface ListFilters {
  cuisineTypes: string[];
  priceRange: [number, number];
  minRating: number;
  features: string[];
  dietaryOptions: string[];
}

export interface FilterOption {
  id: string;
  name: string;
}

export interface Restaurant {
  id: string;
  name: string;
  price_per_person: number | null;
  rating: number | null;
  [key: string]: unknown;
}

interface JunctionRow {
  restaurant_id: string;
}

export function useListFilters() {
  const supabase = createClient();
  
  const [filters, setFilters] = useState<ListFilters>({
    cuisineTypes: [],
    priceRange: [0, 100],
    minRating: 0,
    features: [],
    dietaryOptions: []
  });
  
  const [filterOptions, setFilterOptions] = useState({
    cuisineTypes: [] as FilterOption[],
    features: [] as FilterOption[],
    dietaryOptions: [] as FilterOption[]
  });
  
  const [filterPreview, setFilterPreview] = useState<Restaurant[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Fetch filter options
  useEffect(() => {
    async function fetchFilterOptions() {
      const [cuisines, feats, diets] = await Promise.all([
        supabase.from('cuisine_types').select('*'),
        supabase.from('restaurant_features').select('*'),
        supabase.from('restaurant_dietary_options').select('*')
      ]);
      
      setFilterOptions({
        cuisineTypes: cuisines.data || [],
        features: feats.data || [],
        dietaryOptions: diets.data || []
      });
    }
    
    fetchFilterOptions();
  }, []);

  // Fetch restaurants matching filters
  useEffect(() => {
    async function fetchFilteredRestaurants() {
      setLoadingPreview(true);
      try {
        let query = supabase.from('restaurants').select('*');
        
        if (filters.cuisineTypes.length > 0) {
          const { data: junctionData } = await supabase
            .from('restaurant_cuisine_types')
            .select('restaurant_id')
            .in('cuisine_type_id', filters.cuisineTypes);
          
          const typedData = junctionData as JunctionRow[] | null;
          if (typedData && typedData.length > 0) {
            const restaurantIds = [...new Set(typedData.map((j: JunctionRow) => j.restaurant_id))];
            query = query.in('id', restaurantIds);
          } else {
            setFilterPreview([]);
            setLoadingPreview(false);
            return;
          }
        }
        
        if (filters.features.length > 0) {
          const { data: junctionData } = await supabase
            .from('restaurant_restaurant_features')
            .select('restaurant_id')
            .in('feature_id', filters.features);
          
          const typedData = junctionData as JunctionRow[] | null;
          if (typedData && typedData.length > 0) {
            const restaurantIds = [...new Set(typedData.map((j: JunctionRow) => j.restaurant_id))];
            query = query.in('id', restaurantIds);
          } else {
            setFilterPreview([]);
            setLoadingPreview(false);
            return;
          }
        }
        
        if (filters.dietaryOptions.length > 0) {
          const { data: junctionData } = await supabase
            .from('restaurant_dietary_options_junction')
            .select('restaurant_id')
            .in('dietary_option_id', filters.dietaryOptions);
          
          const typedData = junctionData as JunctionRow[] | null;
          if (typedData && typedData.length > 0) {
            const restaurantIds = [...new Set(typedData.map((j: JunctionRow) => j.restaurant_id))];
            query = query.in('id', restaurantIds);
          } else {
            setFilterPreview([]);
            setLoadingPreview(false);
            return;
          }
        }
        
        query = query
          .gte('price_per_person', filters.priceRange[0])
          .lte('price_per_person', filters.priceRange[1])
          .gte('rating', filters.minRating);
        
        const { data, error } = await query;
        
        if (!error && data) {
          setFilterPreview(data as Restaurant[]);
        }
      } catch (err) {
        console.error('Error fetching filtered restaurants:', err);
      } finally {
        setLoadingPreview(false);
      }
    }
    
    fetchFilteredRestaurants();
  }, [filters]);

  const toggleFilter = (category: keyof ListFilters, id: string) => {
    setFilters(prev => {
      const current = prev[category] as string[];
      const updated = current.includes(id) 
        ? current.filter(item => item !== id)
        : [...current, id];
      return { ...prev, [category]: updated };
    });
  };

  const updatePriceRange = (min: number, max: number) => {
    setFilters(prev => ({ ...prev, priceRange: [min, max] as [number, number] }));
  };

  const updateMinRating = (rating: number) => {
    setFilters(prev => ({ ...prev, minRating: rating }));
  };

  return {
    filters,
    setFilters,
    filterOptions,
    filterPreview,
    loadingPreview,
    toggleFilter,
    updatePriceRange,
    updateMinRating
  };
}