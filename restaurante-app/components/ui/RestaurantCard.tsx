import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';

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
          <div className="mt-4 text-indigo-600 font-semibold">
            €{restaurant.price_per_person.toFixed(2)} por pessoa
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;