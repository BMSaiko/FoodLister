// app/restaurants/[id]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import Navbar from '@/components/layouts/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, Star, ListChecks, Edit, MapPin, Globe, 
  FileText, Check, X, User, Euro, Tag, Clock 
} from 'lucide-react';
import { formatPrice, categorizePriceLevel, getRatingClass, formatDate } from '@/utils/formatters';

export default function RestaurantDetails() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  
  useEffect(() => {
    async function fetchRestaurantDetails() {
      if (!id) return;
      
      setLoading(true);
      
      // Fetch restaurant details
      const { data: restaurantData } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();
        
      if (restaurantData) {
        setRestaurant(restaurantData);
        
        // Fetch lists containing this restaurant
        const { data: listRelations } = await supabase
          .from('list_restaurants')
          .select('list_id')
          .eq('restaurant_id', id);
          
        if (listRelations && listRelations.length > 0) {
          const listIds = listRelations.map(item => item.list_id);
          
          const { data: listDetails } = await supabase
            .from('lists')
            .select('*')
            .in('id', listIds);
            
          if (listDetails) {
            setLists(listDetails);
          }
        }
      }
      
      setLoading(false);
    }
    
    fetchRestaurantDetails();
  }, [id]);
  
  // Função para abrir o Google Maps com a localização
  const openInMaps = (location) => {
    if (!location) return;
    
    const encodedLocation = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, '_blank');
  };

  // Renderiza o nível de preço com ícones de Euro
  const renderPriceLevel = (price) => {
    const priceCategory = categorizePriceLevel(price);
    
    return (
      <div className="flex items-center mt-4 bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center">
          {Array(priceCategory.level).fill(0).map((_, i) => (
            <Euro key={i} className="h-4 w-4 text-amber-600" fill="currentColor" />
          ))}
          {Array(4 - priceCategory.level).fill(0).map((_, i) => (
            <Euro key={i + priceCategory.level} className="h-4 w-4 text-gray-300" />
          ))}
        </div>
        <span className="ml-2 text-sm font-medium text-gray-700">{priceCategory.label}</span>
        <div className="ml-auto text-amber-600 font-semibold">
          {formatPrice(price)}
          <span className="text-sm text-gray-500 ml-1">por pessoa</span>
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse bg-white rounded-xl shadow-md h-96 mb-6"></div>
          <div className="animate-pulse bg-white p-6 rounded-lg shadow-md h-24 mb-6"></div>
        </div>
      </div>
    );
  }
  
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Restaurante não encontrado</h2>
          <Link href="/restaurants" className="mt-4 inline-block text-amber-600 hover:underline">
            Voltar para a página de restaurantes
          </Link>
        </div>
      </div>
    );
  }

  // Obtém a classe de estilo para a avaliação
  const ratingClass = getRatingClass(restaurant.rating);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="flex justify-between items-center mb-6">
          <Link href="/restaurants" className="flex items-center text-amber-600 hover:underline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
          
          <div className="flex space-x-2">
            <Link 
              href={`/restaurants/${id}/edit`}
              className="flex items-center bg-amber-500 text-white px-3 py-2 rounded hover:bg-amber-600 transition-colors"
            >
              <Edit className="h-4 w-4 mr-1" />
              <span className="text-sm">Editar</span>
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="relative h-48 sm:h-56 md:h-64 w-full">
            <Image
              src={restaurant.image_url || '/placeholder-restaurant.jpg'}
              alt={restaurant.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, 1200px"
              priority
            />
            
            {/* Badge mais destacado e visível */}
            <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full flex items-center shadow-md ${
              restaurant.visited ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {restaurant.visited ? (
                <>
                  <Check className="h-4 w-4 mr-1.5" />
                  <span className="text-sm font-medium">Visitado</span>
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-1.5" />
                  <span className="text-sm font-medium">Não visitado</span>
                </>
              )}
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{restaurant.name}</h1>
              <div className={`flex items-center ${ratingClass} px-3 py-2 rounded self-start`}>
                <Star className="h-4 w-4 sm:h-5 sm:w-5 mr-1" fill="currentColor" />
                <span className="font-semibold text-base sm:text-lg">{restaurant.rating.toFixed(1)}</span>
              </div>
            </div>
            
            {/* Se houver tipo de cozinha, mostrar como tag */}
            {restaurant.cuisine && (
              <div className="mt-3 flex items-center">
                <Tag className="h-4 w-4 text-amber-500 mr-1.5" />
                <span className="text-sm font-medium px-2 py-1 bg-amber-50 text-amber-700 rounded-md">
                  {restaurant.cuisine}
                </span>
              </div>
            )}
            
            <p className="text-gray-600 mt-4">{restaurant.description}</p>
            
            {/* Informações de preço mais destacadas */}
            {renderPriceLevel(restaurant.price_per_person)}

            
            {/* Campos adicionais agora com cards estilizados */}
            <div className="mt-3 space-y-3">
              {restaurant.location && (
                <div 
                  className="flex items-center text-gray-700 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => openInMaps(restaurant.location)}
                >
                  <MapPin className="h-5 w-5 mr-3 text-amber-500" />
                  <span className="flex-grow">{restaurant.location}</span>
                  <span className="text-xs text-amber-600">Abrir no mapa</span>
                </div>
              )}
              
              {restaurant.source_url && (
                <div className="flex items-center text-gray-700 p-3 bg-gray-50 rounded-lg">
                  <Globe className="h-5 w-5 mr-3 text-amber-500" />
                  <span className="flex-grow">Fonte Original</span>
                  <a 
                    href={restaurant.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-600 hover:text-amber-800 hover:underline text-sm"
                  >
                    Visitar site
                  </a>
                </div>
              )}
              
              {restaurant.menu_url && (
                <div className="flex items-center text-gray-700 p-3 bg-gray-50 rounded-lg">
                  <FileText className="h-5 w-5 mr-3 text-amber-500" />
                  <span className="flex-grow">Menu do restaurante</span>
                  <a 
                    href={restaurant.menu_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-600 hover:text-amber-800 hover:underline text-sm"
                  >
                    Ver menu
                  </a>
                </div>
              )}
            </div>
            {/* Informações do criador */}
            <div className="mt-3 text-sm flex items-center text-gray-500">
              <User className="h-4 w-4 mr-1" />
              Adicionado por: {restaurant.creator || 'Anônimo'}
            </div>
            {/* Data de adição */}
            {restaurant.created_at && (
              <div className="mt-3 text-sm flex items-center text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                Adicionado em: {formatDate(restaurant.created_at)}
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <ListChecks className="h-5 w-5 mr-2 text-amber-500" />
            Listas que incluem este restaurante
          </h2>
          
          {lists.length === 0 ? (
            <p className="text-gray-500 mt-4">Este restaurante não está em nenhuma lista.</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {lists.map(list => (
                <Link key={list.id} href={`/lists/${list.id}`} className="block">
                  <div className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                    <h3 className="font-medium text-gray-800 text-sm sm:text-base">{list.name}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2">{list.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}