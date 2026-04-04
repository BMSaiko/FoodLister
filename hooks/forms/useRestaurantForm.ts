/**
 * useRestaurantForm - Hook for restaurant form state and operations
 * Handles form data, cuisine types, dietary options, and features loading
 */

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/libs/supabase/client';
import { toast } from 'react-toastify';
import { convertCloudinaryUrl } from '@/utils/cloudinaryConverter';
import { validateAndNormalizePhoneNumbers, validatePhoneNumber } from '@/utils/formatters';

export interface RestaurantFormData {
  name: string;
  description: string;
  image_url: string;
  images: any[];
  display_image_index: number;
  location: string;
  source_url: string;
  menu_links: any[];
  menu_images: any[];
  phone_numbers: string[];
  creator?: string;
  selectedCuisineTypes: string[];
  selectedDietaryOptions: string[];
  selectedFeatures: string[];
  latitude?: number;
  longitude?: number;
}

export interface CuisineType {
  id: string;
  name: string;
}

export interface DietaryOption {
  id: string;
  name: string;
}

export interface Feature {
  id: string;
  name: string;
}

export interface UseRestaurantFormOptions {
  restaurantId?: string;
  onSuccess?: (restaurant: any) => void;
  onError?: (error: Error) => void;
}

const DEFAULT_FORM_DATA: RestaurantFormData = {
  name: '',
  description: '',
  image_url: '',
  images: [],
  display_image_index: -1,
  location: '',
  source_url: '',
  menu_links: [],
  menu_images: [],
  phone_numbers: [],
  selectedCuisineTypes: [],
  selectedDietaryOptions: [],
  selectedFeatures: []
};

export function useRestaurantForm(options: UseRestaurantFormOptions = {}) {
  const { restaurantId, onSuccess, onError } = options;
  
  const [formData, setFormData] = useState<RestaurantFormData>(DEFAULT_FORM_DATA);
  const [cuisineTypes, setCuisineTypes] = useState<CuisineType[]>([]);
  const [dietaryOptions, setDietaryOptions] = useState<DietaryOption[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(!!restaurantId);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  // Load option data (cuisine types, dietary options, features)
  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        
        const [cuisineResult, dietaryResult, featuresResult] = await Promise.all([
          supabase.from('cuisine_types').select('*').order('name'),
          supabase.from('restaurant_dietary_options').select('*').order('name'),
          supabase.from('restaurant_features').select('*').order('name')
        ]);

        if (cuisineResult.error) throw cuisineResult.error;
        if (dietaryResult.error) throw dietaryResult.error;
        if (featuresResult.error) throw featuresResult.error;

        setCuisineTypes(cuisineResult.data || []);
        setDietaryOptions(dietaryResult.data || []);
        setFeatures(featuresResult.data || []);
      } catch (error) {
        console.error('Error loading restaurant options:', error);
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  // Load restaurant data if editing
  useEffect(() => {
    if (!restaurantId) return;

    async function loadRestaurant() {
      try {
        setLoading(true);

        const [restaurantResult, cuisineResult, dietaryResult, featuresResult] = await Promise.all([
          (supabase.from('restaurants') as any).select('*').eq('id', restaurantId as string).single(),
          (supabase.from('restaurant_cuisine_types') as any).select('cuisine_type_id').eq('restaurant_id', restaurantId as string),
          (supabase.from('restaurant_dietary_options_junction') as any).select('dietary_option_id').eq('restaurant_id', restaurantId as string),
          (supabase.from('restaurant_restaurant_features') as any).select('feature_id').eq('restaurant_id', restaurantId as string)
        ]);

        if (restaurantResult.error) throw restaurantResult.error;
        if (cuisineResult.error) throw cuisineResult.error;
        if (dietaryResult.error) throw dietaryResult.error;
        if (featuresResult.error) throw featuresResult.error;

        const data = restaurantResult.data as any;
        setFormData({
          name: data.name,
          description: data.description,
          image_url: data.image_url || '',
          images: data.images || [],
          display_image_index: data.display_image_index ?? -1,
          location: data.location || '',
          source_url: data.source_url || '',
          menu_links: data.menu_links || [],
          menu_images: data.menu_images || [],
          phone_numbers: data.phone_numbers || [],
          creator: data.creator || 'Anônimo',
          selectedCuisineTypes: (cuisineResult.data as any[])?.map((r: any) => r.cuisine_type_id) || [],
          selectedDietaryOptions: (dietaryResult.data as any[])?.map((r: any) => r.dietary_option_id) || [],
          selectedFeatures: (featuresResult.data as any[])?.map((r: any) => r.feature_id) || []
        });
      } catch (error) {
        console.error('Error fetching restaurant:', error);
        toast.error('Erro ao carregar restaurante', { position: "top-center", autoClose: 4000 });
        onError?.(error as Error);
      } finally {
        setLoading(false);
      }
    }

    loadRestaurant();
  }, [restaurantId]);

  // Form field handlers
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  }, []);

  const setFieldValue = useCallback((name: keyof RestaurantFormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const toggleCuisineType = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCuisineTypes: prev.selectedCuisineTypes.includes(id)
        ? prev.selectedCuisineTypes.filter(i => i !== id)
        : [...prev.selectedCuisineTypes, id]
    }));
  }, []);

  const toggleDietaryOption = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedDietaryOptions: prev.selectedDietaryOptions.includes(id)
        ? prev.selectedDietaryOptions.filter(i => i !== id)
        : [...prev.selectedDietaryOptions, id]
    }));
  }, []);

  const toggleFeature = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedFeatures: prev.selectedFeatures.includes(id)
        ? prev.selectedFeatures.filter(i => i !== id)
        : [...prev.selectedFeatures, id]
    }));
  }, []);

  const handleGoogleMapsData = useCallback((data: any) => {
    setFormData(prev => ({
      ...prev,
      name: data.name || prev.name,
      location: data.location || prev.location,
      source_url: data.source_url || prev.source_url,
      latitude: data.latitude || prev.latitude,
      longitude: data.longitude || prev.longitude
    }));
  }, []);

  // Validation
  const validate = useCallback((): string | null => {
    if (!formData.name) {
      return 'Por favor, preencha o nome do restaurante.';
    }

    const nonEmptyPhones = formData.phone_numbers.filter(p => p.trim().length > 0);
    if (nonEmptyPhones.length > 0) {
      const invalidPhones = nonEmptyPhones.filter(p => !validatePhoneNumber(p.trim()));
      if (invalidPhones.length > 0) {
        return `Número(s) de telefone inválido(s): ${invalidPhones.join(', ')}. Use o formato internacional: +351 912 345 678`;
      }
    }

    return null;
  }, [formData.name, formData.phone_numbers]);

  // Save restaurant (create or update)
  const saveRestaurant = useCallback(async (isEdit: boolean = false): Promise<any | null> => {
    const validationError = validate();
    if (validationError) {
      toast.error(validationError, { position: "top-center", autoClose: 4000 });
      return null;
    }

    setSaving(true);

    try {
      const processedImageUrl = convertCloudinaryUrl(formData.image_url) || '/placeholder-restaurant.jpg';

      if (isEdit && restaurantId) {
        // Update existing restaurant
        const { error: updateError } = await (supabase
          .from('restaurants') as any)
          .update({
            name: formData.name,
            description: formData.description,
            image_url: processedImageUrl,
            images: formData.images,
            display_image_index: formData.display_image_index,
            location: formData.location,
            source_url: formData.source_url,
            menu_links: formData.menu_links,
            menu_images: formData.menu_images,
            phone_numbers: validateAndNormalizePhoneNumbers(formData.phone_numbers),
            latitude: formData.latitude || null,
            longitude: formData.longitude || null
          })
          .eq('id', restaurantId);

        if (updateError) throw updateError;

        // Update relations
        await updateRelations(restaurantId);

        toast.success('Restaurante atualizado com sucesso!', { position: "top-center", autoClose: 3000 });
        return { id: restaurantId };
      } else {
        // Create new restaurant
        const { data, error } = await (supabase
          .from('restaurants') as any)
          .insert({
            name: formData.name,
            description: formData.description,
            image_url: processedImageUrl,
            images: formData.images,
            display_image_index: formData.display_image_index,
            location: formData.location || '',
            source_url: formData.source_url || '',
            menu_links: formData.menu_links,
            menu_images: formData.menu_images,
            phone_numbers: validateAndNormalizePhoneNumbers(formData.phone_numbers),
            latitude: formData.latitude || null,
            longitude: formData.longitude || null
          })
          .select()
          .single();

        if (error) throw error;

        // Create relations
        if (data?.id) {
          await createRelations(data.id);
        }

        toast.success('Restaurante criado com sucesso!', { position: "top-center", autoClose: 3000 });
        return data;
      }
    } catch (error) {
      console.error('Error saving restaurant:', error);
      
      if (error instanceof Error && (error as any).code === '42501') {
        toast.error('Erro de permissão. Verifique suas configurações de acesso.', {
          position: "top-center",
          autoClose: 6000
        });
      } else {
        toast.error('Erro ao salvar restaurante. Tente novamente.', {
          position: "top-center",
          autoClose: 5000
        });
      }
      
      onError?.(error as Error);
      return null;
    } finally {
      setSaving(false);
    }
  }, [formData, restaurantId, validate, onError]);

  // Helper to create relations
  const createRelations = async (restaurantId: string) => {
    const promises = [];

    if (formData.selectedCuisineTypes.length > 0) {
      promises.push(
        (supabase.from('restaurant_cuisine_types') as any).insert(
          formData.selectedCuisineTypes.map(id => ({ restaurant_id: restaurantId, cuisine_type_id: id }))
        )
      );
    }

    if (formData.selectedDietaryOptions.length > 0) {
      promises.push(
        (supabase.from('restaurant_dietary_options_junction') as any).insert(
          formData.selectedDietaryOptions.map(id => ({ restaurant_id: restaurantId, dietary_option_id: id }))
        )
      );
    }

    if (formData.selectedFeatures.length > 0) {
      promises.push(
        (supabase.from('restaurant_restaurant_features') as any).insert(
          formData.selectedFeatures.map(id => ({ restaurant_id: restaurantId, feature_id: id }))
        )
      );
    }

    await Promise.all(promises);
  };

  // Helper to update relations (delete + insert)
  const updateRelations = async (restaurantId: string) => {
    const promises = [];

    // Delete existing relations
    promises.push((supabase.from('restaurant_cuisine_types') as any).delete().eq('restaurant_id', restaurantId));
    promises.push((supabase.from('restaurant_dietary_options_junction') as any).delete().eq('restaurant_id', restaurantId));
    promises.push((supabase.from('restaurant_restaurant_features') as any).delete().eq('restaurant_id', restaurantId));

    await Promise.all(promises);

    // Insert new relations
    return createRelations(restaurantId);
  };

  // Reset form
  const reset = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
  }, []);

  return {
    formData,
    cuisineTypes,
    dietaryOptions,
    features,
    loading,
    loadingOptions,
    saving,
    handleChange,
    setFieldValue,
    setFormData,
    toggleCuisineType,
    toggleDietaryOption,
    toggleFeature,
    handleGoogleMapsData,
    saveRestaurant,
    reset
  };
}