// components/ui/RestaurantCard.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Check, X, MapPin } from 'lucide-react';

const RestaurantCard = ({ restaurant }) => {
  return (
    <Link href={`/restaurants/${restaurant.id}`}>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        <div className="relative h-48 w-full">
          <Image
            src={restaurant.image_url || '/placeholder-restaurant.jpg'}
            alt={restaurant.name}
            fill
            className="object-cover"
          />
          
          {/* Badge de visitado/não visitado */}
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
        <div className="p-4 flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg text-gray-800">{restaurant.name}</h3>
            <div className="flex items-center bg-yellow-100 px-2 py-1 rounded">
              <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
              <span className="font-semibold">{restaurant.rating.toFixed(1)}</span>
            </div>
          </div>
          <p className="text-gray-600 mt-2 line-clamp-2">{restaurant.description}</p>
          
          {restaurant.location && (
            <div className="flex items-center text-gray-500 text-sm mt-2 line-clamp-1">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span>{restaurant.location}</span>
            </div>
          )}
          
          <div className="mt-4 text-amber-600 font-semibold">
            €{restaurant.price_per_person.toFixed(2)} por pessoa
          </div>
          
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