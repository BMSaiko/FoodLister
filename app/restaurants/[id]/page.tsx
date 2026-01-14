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
  FileText, Check, X, User, Euro, Tag, Clock, Share2, Copy, MessageCircle, Send, Twitter, Facebook 
} from 'lucide-react';
import { formatPrice, categorizePriceLevel, getRatingClass, formatDate } from '@/utils/formatters';
import { convertImgurUrl } from '@/utils/imgurConverter';
import MapSelectorModal from '@/components/ui/MapSelectorModal';

export default function RestaurantDetails() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [visited, setVisited] = useState(false);
  const [lists, setLists] = useState([]);
  const [cuisineTypes, setCuisineTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const supabase = createClient();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const shareRef = React.useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }

    async function fetchRestaurantDetails() {
      if (!id) return;
      
      setLoading(true);
      
      try {
        // Fetch restaurant details
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', id)
          .single();
          
        if (restaurantError) throw restaurantError;
        
        if (restaurantData) {
          setRestaurant(restaurantData);
          setVisited(restaurantData.visited || false);
          
          // Fetch cuisine types for this restaurant
          const { data: cuisineRelations, error: cuisineRelationsError } = await supabase
            .from('restaurant_cuisine_types')
            .select('cuisine_type_id')
            .eq('restaurant_id', id);
            
          if (cuisineRelationsError) throw cuisineRelationsError;
          
          if (cuisineRelations && cuisineRelations.length > 0) {
            const cuisineTypeIds = cuisineRelations.map(item => item.cuisine_type_id);
            
            const { data: cuisineTypeDetails, error: cuisineTypeError } = await supabase
              .from('cuisine_types')
              .select('*')
              .in('id', cuisineTypeIds);
              
            if (cuisineTypeError) throw cuisineTypeError;
            
            if (cuisineTypeDetails) {
              setCuisineTypes(cuisineTypeDetails);
            }
          }
          
          // Fetch lists containing this restaurant
          const { data: listRelations, error: listRelationsError } = await supabase
            .from('list_restaurants')
            .select('list_id')
            .eq('restaurant_id', id);
            
          if (listRelationsError) throw listRelationsError;
          
          if (listRelations && listRelations.length > 0) {
            const listIds = listRelations.map(item => item.list_id);
            
            const { data: listDetails, error: listDetailsError } = await supabase
              .from('lists')
              .select('*')
              .in('id', listIds);
              
            if (listDetailsError) throw listDetailsError;
            
            if (listDetails) {
              setLists(listDetails);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching restaurant details:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRestaurantDetails();
  }, [id]);

  useEffect(() => {
    if (!isShareOpen) return;
    const onClick = (e: MouseEvent) => {
      if (shareRef.current && e.target instanceof Node && !shareRef.current.contains(e.target)) {
        setIsShareOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [isShareOpen]);

  const handleShareClick = async () => {
    const shareData = {
      title: restaurant?.name || 'Restaurante',
      text: `Confira este restaurante: ${restaurant?.name || ''}`,
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        setIsShareOpen((o) => !o);
      }
    } catch (e) {
      console.error('Erro ao compartilhar:', e);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsShareOpen(false);
      alert('Link copiado para a área de transferência');
    } catch (e) {
      console.error('Erro ao copiar link:', e);
    }
  };
  
  const handleToggleVisited = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsUpdating(true);
    try {
      const newVisitedStatus = !visited;
      
      const { error } = await supabase
        .from('restaurants')
        .update({ visited: newVisitedStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      setVisited(newVisitedStatus);
      if (restaurant) {
        setRestaurant({ ...restaurant, visited: newVisitedStatus });
      }
    } catch (err) {
      console.error('Erro ao atualizar status de visitado:', err);
      setVisited(!visited);
    } finally {
      setIsUpdating(false);
    }
  };
  


  // Get color class based on price level
  const getPriceColorClass = (level) => {
    // Classes para os ícones - variação de cores mantendo legibilidade
    switch(level) {
      case 1: return 'text-amber-400';
      case 2: return 'text-amber-500';
      case 3: return 'text-amber-600';
      case 4: return 'text-amber-800';
      default: return 'text-amber-400';
    }
  };
  
  // Classe para o texto do label - garantindo melhor legibilidade
  const getPriceLabelClass = (level) => {
    switch(level) {
      case 1: return 'text-amber-400 font-bold';
      case 2: return 'text-amber-500 font-bold';
      case 3: return 'text-amber-600 font-bold';
      case 4: return 'text-amber-800 font-bold';
      default: return 'text-amber-400 font-medium';
    }
  };

  // Renderiza o nível de preço com ícones de Euro
  const renderPriceLevel = (price) => {
    const priceCategory = categorizePriceLevel(price);
    const priceColorClass = getPriceColorClass(priceCategory.level);
    
    return (
      <div className="flex items-center mt-4 bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center">
          {Array(priceCategory.level).fill(0).map((_, i) => (
            <Euro key={i} className={`h-4 w-4 ${priceColorClass}`} fill="currentColor" />
          ))}
          {Array(4 - priceCategory.level).fill(0).map((_, i) => (
            <Euro key={i + priceCategory.level} className="h-4 w-4 text-gray-300" />
          ))}
        </div>
        <span className={`ml-2 text-sm ${getPriceLabelClass(priceCategory.level)}`}>{priceCategory.label}</span>
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
      
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
          <Link href="/restaurants" className="flex items-center text-amber-600 hover:text-amber-700 active:text-amber-800 transition-colors min-h-[44px] sm:min-h-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm sm:text-base">Voltar</span>
          </Link>
          
          <div className="flex w-full sm:w-auto gap-2">
            <div className="relative w-full sm:w-auto" ref={shareRef}>
              <button
                type="button"
                onClick={handleShareClick}
                className="flex items-center justify-center px-4 py-2.5 sm:py-2 bg-white text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm sm:text-base min-h-[44px] sm:min-h-0 w-full sm:w-auto"
                aria-label="Compartilhar"
                title="Compartilhar"
              >
                <Share2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Compartilhar</span>
                <span className="sm:hidden">Share</span>
              </button>
              {isShareOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <ul className="py-1 text-sm text-gray-700">
                    <li>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent('Confira este restaurante! ' + shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 hover:bg-gray-50"
                      >
                        <MessageCircle className="h-4 w-4 mr-2 text-green-600" /> WhatsApp
                      </a>
                    </li>
                    <li>
                      <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Confira este restaurante!')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 hover:bg-gray-50"
                      >
                        <Send className="h-4 w-4 mr-2 text-sky-600" /> Telegram
                      </a>
                    </li>
                    <li>
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Confira este restaurante!')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 hover:bg-gray-50"
                      >
                        <Twitter className="h-4 w-4 mr-2 text-black" /> Twitter/X
                      </a>
                    </li>
                    <li>
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 hover:bg-gray-50"
                      >
                        <Facebook className="h-4 w-4 mr-2 text-blue-600" /> Facebook
                      </a>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="w-full text-left flex items-center px-3 py-2 hover:bg-gray-50"
                      >
                        <Copy className="h-4 w-4 mr-2" /> Copiar link
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <Link 
              href={`/restaurants/${id}/edit`}
              className="flex items-center justify-center bg-amber-500 text-white px-4 py-2.5 sm:px-3 sm:py-2 rounded-md hover:bg-amber-600 active:bg-amber-700 transition-colors w-full sm:w-auto min-h-[44px] sm:min-h-0"
            >
              <Edit className="h-4 w-4 mr-1.5 sm:mr-1" />
              <span className="text-sm sm:text-base">Editar</span>
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 sm:mb-8">
          <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 w-full">
            <Image
              src={convertImgurUrl(restaurant.image_url) || '/placeholder-restaurant.jpg'}
              alt={restaurant.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, 1200px"
              priority
            />
            
            {/* Badge com Switch Button */}
            <button
              onClick={handleToggleVisited}
              disabled={isUpdating}
              className={`absolute top-4 right-4 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-200 cursor-pointer hover:shadow-md shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                visited 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
              title={visited ? 'Clique para marcar como não visitado' : 'Clique para marcar como visitado'}
            >
              {visited ? (
                <>
                  <Check className="h-4 w-4" />
                  <span className="text-sm font-medium">Visitado</span>
                </>
              ) : (
                <>
                  <X className="h-4 w-4" />
                  <span className="text-sm font-medium">Não visitado</span>
                </>
              )}
            </button>
          </div>
          
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{restaurant.name}</h1>
              {visited && (
                <div className={`flex items-center ${ratingClass} px-3 py-2 rounded self-start`}>
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 mr-1" fill="currentColor" />
                  <span className="font-semibold text-base sm:text-lg">{restaurant.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            
            {/* Mostrar categorias culinárias */}
            {cuisineTypes && cuisineTypes.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {cuisineTypes.map(type => (
                  <span 
                    key={type.id} 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700"
                  >
                    <Tag className="h-4 w-4 mr-1.5 text-amber-500" />
                    {type.name}
                  </span>
                ))}
              </div>
            )}
            
            <p className="text-gray-600 mt-4">{restaurant.description}</p>
            
            {/* Informações de preço mais destacadas - apenas se visitado */}
            {visited && renderPriceLevel(restaurant.price_per_person)}
            
            {/* Campos adicionais agora com cards estilizados */}
            <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
              {restaurant.location && (
                <div
                  className="flex items-center text-gray-700 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer min-h-[56px] sm:min-h-0"
                  onClick={() => setIsMapModalOpen(true)}
                >
                  <MapPin className="h-5 w-5 mr-3 text-amber-500 flex-shrink-0" />
                  <span className="flex-grow text-sm sm:text-base">{restaurant.location}</span>
                  <span className="text-xs sm:text-sm text-amber-600 ml-2">Abrir no mapa</span>
                </div>
              )}
              
              {restaurant.source_url && (
                <div 
                  className="flex items-center text-gray-700 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer min-h-[56px] sm:min-h-0"
                  onClick={() => window.open(restaurant.source_url, '_blank', 'noopener,noreferrer')}
                >
                  <Globe className="h-5 w-5 mr-3 text-amber-500 flex-shrink-0" />
                  <span className="flex-grow text-sm sm:text-base">Fonte Original</span>
                  <a 
                    href={restaurant.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-600 hover:text-amber-800 hover:underline text-xs sm:text-sm ml-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Visitar site
                  </a>
                </div>
              )}

              {restaurant.menu_url && (
                <div 
                  className="flex items-center text-gray-700 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer min-h-[56px] sm:min-h-0"
                  onClick={() => window.open(restaurant.menu_url, '_blank', 'noopener,noreferrer')}
                >
                  <FileText className="h-5 w-5 mr-3 text-amber-500 flex-shrink-0" />
                  <span className="flex-grow text-sm sm:text-base">Menu do restaurante</span>
                  <a 
                    href={restaurant.menu_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-600 hover:text-amber-800 hover:underline text-xs sm:text-sm ml-2"
                    onClick={(e) => e.stopPropagation()}
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
        
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
            <ListChecks className="h-5 w-5 mr-2 text-amber-500" />
            Listas que incluem este restaurante
          </h2>
          
          {lists.length === 0 ? (
            <p className="text-gray-500 mt-3 sm:mt-4 text-sm sm:text-base">Este restaurante não está em nenhuma lista.</p>
          ) : (
            <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
              {lists.map(list => (
                <Link key={list.id} href={`/lists/${list.id}`} className="block">
                  <div className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[60px] sm:min-h-0">
                    <h3 className="font-medium text-gray-800 text-sm sm:text-base">{list.name}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2">{list.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <MapSelectorModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        location={restaurant.location}
        latitude={restaurant.latitude}
        longitude={restaurant.longitude}
      />
    </div>
  );
}
