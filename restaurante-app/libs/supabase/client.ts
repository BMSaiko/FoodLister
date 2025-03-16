import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Tipos para as tabelas do Supabase
export type Restaurant = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price_per_person: number;
  rating: number;
};

export type List = {
  id: string;
  name: string;
  description: string;
  created_at: string;
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
    };
  };
};

// Certifique-se de criar um arquivo .env.local com estas variáveis
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const createClient = () => 
  createSupabaseClient<Database>(supabaseUrl, supabaseKey);