/**
 * useListForm - Hook for list form state and operations
 * Handles form data, restaurant selection, and list CRUD operations
 */

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/libs/supabase/client';
import { toast } from 'react-toastify';

export interface ListFormData {
  name: string;
  description: string;
  isPublic: boolean;
  tags: string[];
  cover_image_url: string;
}

export interface Restaurant {
  id: string;
  name: string;
  location?: string;
  [key: string]: any;
}

export interface UseListFormOptions {
  listId?: string;
  onSuccess?: (listId: string) => void;
  onError?: (error: Error) => void;
}

const DEFAULT_FORM_DATA: ListFormData = {
  name: '',
  description: '',
  isPublic: true,
  tags: [],
  cover_image_url: ''
};

export function useListForm(options: UseListFormOptions = {}) {
  const { listId, onSuccess, onError } = options;
  
  const [formData, setFormData] = useState<ListFormData>(DEFAULT_FORM_DATA);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(!!listId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch all restaurants for selection
  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*');
        
        if (error) throw error;
        if (data) setRestaurants(data);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
      }
    }

    fetchRestaurants();
  }, []);

  // Load list data if editing
  useEffect(() => {
    if (!listId) return;

    async function loadList() {
      try {
        setLoading(true);
        setError(null);

        // Fetch list data
        const { data: listData, error: listError } = await supabase
          .from('lists')
          .select('*')
          .eq('id', listId as string)
          .single();

        if (listError) throw listError;

        if (!listData) {
          setError('Lista não encontrada.');
          return;
        }

        const list = listData as any;
        setFormData({
          name: list.name,
          description: list.description || '',
          isPublic: list.is_public !== false,
          tags: list.tags || [],
          cover_image_url: list.cover_image_url || ''
        });

        // Fetch restaurants in this list
        const { data: listRestaurantsData, error: relError } = await supabase
          .from('list_restaurants')
          .select('restaurant_id')
          .eq('list_id', listId as string);

        if (relError) throw relError;

        if (listRestaurantsData && listRestaurantsData.length > 0) {
          const restaurantIds = (listRestaurantsData as any[]).map((item: any) => item.restaurant_id);

          const { data: restaurantDetails, error: restaurantError } = await supabase
            .from('restaurants')
            .select('*')
            .in('id', restaurantIds);

          if (restaurantError) throw restaurantError;
          if (restaurantDetails) setSelectedRestaurants(restaurantDetails);
        }
      } catch (err) {
        console.error('Error fetching list:', err);
        setError('Erro ao carregar detalhes da lista: ' + ((err as Error).message || 'Unknown error'));
        onError?.(err as Error);
      } finally {
        setLoading(false);
      }
    }

    loadList();
  }, [listId]);

  // Form field handlers
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const setFieldValue = useCallback((name: keyof ListFormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Restaurant selection handlers
  const addRestaurant = useCallback((restaurant: Restaurant) => {
    setSelectedRestaurants(prev => {
      if (prev.some(r => r.id === restaurant.id)) return prev;
      return [...prev, restaurant];
    });
  }, []);

  const removeRestaurant = useCallback((restaurantId: string) => {
    setSelectedRestaurants(prev => prev.filter(r => r.id !== restaurantId));
  }, []);

  // Validation
  const validate = useCallback((): string | null => {
    if (!formData.name.trim()) {
      return 'Por favor, preencha o nome da lista.';
    }
    return null;
  }, [formData.name]);

  // Save list (create or update)
  const saveList = useCallback(async (userId: string, displayName: string, isEdit: boolean = false): Promise<string | null> => {
    const validationError = validate();
    if (validationError) {
      toast.error(validationError, { position: "top-center", autoClose: 4000 });
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      if (isEdit && listId) {
        // Update existing list
        const updateData = {
          name: formData.name,
          description: formData.description,
          is_public: formData.isPublic,
          tags: formData.tags,
          cover_image_url: formData.cover_image_url
        };

        const { error: updateError } = await (supabase
          .from('lists') as any)
          .update(updateData)
          .eq('id', listId as string);

        if (updateError) throw updateError;

        // Update restaurant relations
        await updateListRestaurants(listId as string);

        toast.success('Lista atualizada com sucesso!', { position: "top-center", autoClose: 3000 });
        onSuccess?.(listId);
        return listId;
      } else {
        // Create new list
        const listDataToInsert = {
          name: formData.name,
          description: formData.description || '',
          creator_id: userId,
          creator_name: displayName,
          is_public: formData.isPublic,
          tags: formData.tags,
          cover_image_url: formData.cover_image_url
        };

        const { data: listData, error: listError } = await (supabase
          .from('lists') as any)
          .insert([listDataToInsert])
          .select();

        if (listError) throw listError;

        const newListId = listData[0].id;

        // Add restaurants to the list
        if (selectedRestaurants.length > 0) {
          const restaurantRelations = selectedRestaurants.map(restaurant => ({
            list_id: newListId,
            restaurant_id: restaurant.id
          }));

          const { error: relationError } = await (supabase
            .from('list_restaurants') as any)
            .insert(restaurantRelations);

          if (relationError) throw relationError;
        }

        toast.success('Lista criada com sucesso!', { position: "top-center", autoClose: 3000 });
        onSuccess?.(newListId);
        return newListId;
      }
    } catch (err: any) {
      console.error('Error saving list:', err);
      
      if (err.code === '42501' || err.message?.includes('row-level security policy')) {
        const errorMsg = 'Erro de permissão: O usuário atual não tem permissões para editar listas.';
        setError(errorMsg);
        toast.error(errorMsg, { position: "top-center", autoClose: 5000 });
      } else {
        const errorMsg = 'Erro ao salvar lista. Por favor, tente novamente.';
        setError(errorMsg);
        toast.error(errorMsg, { position: "top-center", autoClose: 5000 });
      }
      
      onError?.(err as Error);
      return null;
    } finally {
      setSaving(false);
    }
  }, [formData, selectedRestaurants, listId, validate, onSuccess, onError]);

  // Helper to update list restaurants (delete + insert)
  const updateListRestaurants = async (listId: string) => {
    // Get current restaurant relations
    const { data: currentRelations, error: relError } = await (supabase
      .from('list_restaurants') as any)
      .select('restaurant_id')
      .eq('list_id', listId);

    if (relError) throw relError;

    const currentRestaurantIds = (currentRelations as any[]).map((rel: any) => rel.restaurant_id);
    const newRestaurantIds = selectedRestaurants.map(r => r.id);

    // Remove restaurants no longer in the list
    const restaurantsToRemove = currentRestaurantIds.filter(id => !newRestaurantIds.includes(id));
    if (restaurantsToRemove.length > 0) {
      const { error: removeError } = await (supabase
        .from('list_restaurants') as any)
        .delete()
        .eq('list_id', listId)
        .in('restaurant_id', restaurantsToRemove);

      if (removeError) throw removeError;
    }

    // Add new restaurants
    const restaurantsToAdd = newRestaurantIds.filter(id => !currentRestaurantIds.includes(id));
    if (restaurantsToAdd.length > 0) {
      const newRelations = restaurantsToAdd.map(restaurantId => ({
        list_id: listId,
        restaurant_id: restaurantId
      }));

      const { error: addError } = await (supabase
        .from('list_restaurants') as any)
        .insert(newRelations);

      if (addError) throw addError;
    }
  };

  // Reset form
  const reset = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
    setSelectedRestaurants([]);
    setError(null);
  }, []);

  // Filter restaurants based on search query
  const getAvailableRestaurants = useCallback((searchQuery: string): Restaurant[] => {
    return restaurants
      .filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(r => !selectedRestaurants.some(s => s.id === r.id))
      .slice(0, 20);
  }, [restaurants, selectedRestaurants]);

  return {
    formData,
    restaurants,
    selectedRestaurants,
    loading,
    saving,
    error,
    handleChange,
    setFieldValue,
    setFormData,
    addRestaurant,
    removeRestaurant,
    setSelectedRestaurants,
    saveList,
    reset,
    getAvailableRestaurants,
    setError
  };
}