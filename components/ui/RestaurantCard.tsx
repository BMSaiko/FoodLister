// components/ui/EnhancedRestaurantCard.tsx (versão com melhor destaque de atributos filtráveis)
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Check, X, MapPin, Euro, Tag } from 'lucide-react';

const RestaurantCard = ({ restaurant }) => {
  // Função para renderizar os preços com ícones €
  const renderPriceCategory = (price) => {
    if (price <= 20) return { label: 'Econômico', level: 1 };
    if (price <= 40) return { label: 'Moderado', level: 2 };
    if (price <= 70) return { label: 'Elevado', level: 3 };
    return { label: 'Luxo', level: 4 };
  };

  const priceCategory = renderPriceCategory(restaurant.price_per_person);
  
  // Estilo de rating baseado no valor
  const getRatingStyle = (rating) => {
    if (rating >= 4.5) return 'bg-green-100 text-green-700';
    if (rating >= 3.5) return 'bg-amber-100 text-amber-700';
    if (rating >= 2.5) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };
  
  const ratingStyle = getRatingStyle(restaurant.rating);

  return (
    <Link href={`/restaurants/${restaurant.id}`}>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full w-full flex flex-col">
        <div className="relative h-40 sm:h-48 w-full">
          <Image
            src={restaurant.image_url || '/placeholder-restaurant.jpg'}
            alt={restaurant.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
          
          {/* Badge de visitado/não visitado mais destacado */}
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-full flex items-center ${
            restaurant.visited ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}>
            {restaurant.visited ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                <span className="text-xs font-medium">Visitado</span>
              </>
            ) : (
              <>
                <X className="h-3 w-3 mr-1" />
                <span className="text-xs font-medium">Não visitado</span>
              </>
            )}
          </div>
        </div>
        <div className="p-3 sm:p-4 flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-base sm:text-lg text-gray-800 line-clamp-1">{restaurant.name}</h3>
            <div className={`flex items-center ${ratingStyle} px-2 py-1 rounded ml-2 flex-shrink-0`}>
              <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="currentColor" />
              <span className="font-semibold text-sm">{restaurant.rating.toFixed(1)}</span>
            </div>
          </div>
          <p className="text-gray-600 mt-2 line-clamp-2 text-sm sm:text-base">{restaurant.description}</p>
          
          {/* Mostrar categoria de preço */}
          <div className="flex items-center mt-2">
            <div className="flex items-center text-gray-600">
              {Array(priceCategory.level).fill(0).map((_, i) => (
                <Euro key={i} className="h-3 w-3 inline-block" fill="currentColor" />
              ))}
              {Array(4 - priceCategory.level).fill(0).map((_, i) => (
                <Euro key={i + priceCategory.level} className="h-3 w-3 inline-block text-gray-300" />
              ))}
              <span className="ml-1 text-xs">{priceCategory.label}</span>
            </div>
            <div className="ml-auto text-amber-600 font-semibold text-sm">
              €{restaurant.price_per_person.toFixed(2)}
            </div>
          </div>
          
          {restaurant.location && (
            <div className="flex items-center text-gray-500 text-xs sm:text-sm mt-2 line-clamp-1">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{restaurant.location}</span>
            </div>
          )}
          
          {restaurant.creator && (
            <div className="mt-2 text-xs text-gray-500">
              Adicionado por: {restaurant.creator}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;