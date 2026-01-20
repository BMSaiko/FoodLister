import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

// Tipos para as tabelas do Supabase
export type Restaurant = {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  price_per_person?: number;
  rating?: number;
  location?: string;        // Novo: endereço/coordenadas para Google Maps
  source_url?: string;      // Novo: link de onde o restaurante foi encontrado
  creator_id: string;      // ID do usuário autenticado (UUID do Supabase Auth)
  creator_name?: string;   // Nome opcional do criador (cache para performance)
  menu_url?: string;        // Novo: link para o menu online
  visited: boolean;        // Novo: status de visita (true = visitado, false = não visitado)
  created_at: string;      // Data de criação
  updated_at: string;      // Data de atualização
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
  creator_id: string;      // ID do usuário autenticado (UUID do Supabase Auth)
  creator_name?: string;   // Nome opcional do criador (cache para performance)
  created_at: string;
  updated_at: string;
};

export type ListRestaurant = {
  list_id: string;
  restaurant_id: string;
};

export type Review = {
  id: string;
  restaurant_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  user_name: string;
};

export type UserRestaurantVisit = {
  id: string;
  user_id: string;
  restaurant_id: string;
  visit_count: number;
  visited: boolean;
  created_at: string;
  updated_at: string;
};

// Tipos para updates das tabelas
export type RestaurantUpdate = {
  name?: string;
  description?: string;
  image_url?: string;
  price_per_person?: number;
  rating?: number;
  location?: string;
  source_url?: string;
  creator_id?: string;
  creator_name?: string;
  menu_url?: string;
  visited?: boolean;
  updated_at?: string;
};

export type ListUpdate = {
  name?: string;
  description?: string;
  creator_id?: string;
  creator_name?: string;
  updated_at?: string;
};

export type ListRestaurantUpdate = {
  list_id?: string;
  restaurant_id?: string;
};

export type CuisineTypeUpdate = {
  name?: string;
  description?: string;
  icon?: string;
  created_at?: string;
};

export type RestaurantCuisineTypeUpdate = {
  restaurant_id?: string;
  cuisine_type_id?: string;
  created_at?: string;
};

export type ReviewUpdate = {
  restaurant_id?: string;
  user_id?: string;
  rating?: number;
  comment?: string;
  updated_at?: string;
  user_name?: string;
};

export type UserRestaurantVisitUpdate = {
  user_id?: string;
  restaurant_id?: string;
  visit_count?: number;
  visited?: boolean;
  updated_at?: string;
};

// Tipos para o Database do Supabase
export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: Restaurant;
        Insert: Omit<Restaurant, 'id' | 'created_at' | 'updated_at' | 'cuisine_types'>;
        Update: RestaurantUpdate;
      };
      lists: {
        Row: List;
        Insert: Omit<List, 'id' | 'created_at' | 'updated_at'>;
        Update: ListUpdate;
      };
      list_restaurants: {
        Row: ListRestaurant;
        Insert: ListRestaurant;
        Update: ListRestaurantUpdate;
      };
      cuisine_types: {
        Row: CuisineType;
        Insert: Omit<CuisineType, 'id' | 'created_at'>;
        Update: CuisineTypeUpdate;
      };
      restaurant_cuisine_types: {
        Row: RestaurantCuisineType;
        Insert: RestaurantCuisineType;
        Update: RestaurantCuisineTypeUpdate;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'>;
        Update: ReviewUpdate;
      };
      user_restaurant_visits: {
        Row: UserRestaurantVisit;
        Insert: Omit<UserRestaurantVisit, 'id' | 'created_at' | 'updated_at'>;
        Update: UserRestaurantVisitUpdate;
      };
    };
  };
};

// Certifique-se de criar um arquivo .env.local com estas variáveis
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseClient: ReturnType<typeof createSupabaseClient<Database>> | null = null;

// Singleton pattern to reuse client instance across requests
export const getClient = () => {
  if (!supabaseClient) {
    if (!supabaseUrl) {
      throw new Error('Environment variable NEXT_PUBLIC_SUPABASE_URL is required.');
    }
    if (!supabaseKey) {
      throw new Error('Environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY is required.');
    }

    supabaseClient = createSupabaseClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  }
  return supabaseClient;
};



// Legacy function for backward compatibility
export const createClient = () => {
  return getClient();
};
