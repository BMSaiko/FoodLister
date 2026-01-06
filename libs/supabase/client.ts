// libs/supabase/client.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Tipos para as tabelas do Supabase
export type Restaurant = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price_per_person: number;
  rating: number;
  location: string;        // Novo: endereço/coordenadas para Google Maps
  source_url: string;      // Novo: link de onde o restaurante foi encontrado
  creator: string;         // Novo: nome da pessoa que adicionou o restaurante
  menu_url: string;        // Novo: link para o menu online
  visited: boolean;        // Novo: status de visita (true = visitado, false = não visitado)
  cuisine_types?: CuisineType[]; // Nova propriedade para relacionamento com categorias
};

export type CuisineType = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at?: string;
};

export type RestaurantCuisineType = {
  restaurant_id: string;
  cuisine_type_id: string;
  created_at?: string;
};

export type List = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  creator: string;         // Novo: nome da pessoa que criou a lista
};

export type ListRestaurant = {
  list_id: string;
  restaurant_id: string;
};

// Tipos para o Database do Supabase
export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: Restaurant;
      };
      lists: {
        Row: List;
      };
      list_restaurants: {
        Row: ListRestaurant;
      };
      cuisine_types: {
        Row: CuisineType;
      };
      restaurant_cuisine_types: {
        Row: RestaurantCuisineType;
      };
    };
  };
};

// Certifique-se de criar um arquivo .env.local com estas variáveis
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('Environment variable NEXT_PUBLIC_SUPABASE_URL is required.');
  }
  if (!supabaseKey) {
    throw new Error('Environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY is required.');
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseKey);
};