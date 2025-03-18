// components/ui/ListCard.tsx
import React from 'react';
import Link from 'next/link';
import { Utensils, User } from 'lucide-react';

const ListCard = ({ list, restaurantCount = 0 }) => {
  return (
    <Link href={`/lists/${list.id}`}>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 p-5 h-full flex flex-col">
        <div className="bg-amber-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-3">
          <Utensils className="h-6 w-6 text-amber-600" />
        </div>
        <h3 className="font-bold text-lg text-gray-800">{list.name}</h3>
        <p className="text-gray-600 mt-2 flex-grow">{list.description}</p>
        
        <div className="mt-4 flex justify-between items-end">
          <div className="text-sm text-gray-500">
            {restaurantCount} restaurantes • Criada em {new Date(list.created_at).toLocaleDateString('pt-PT')}
          </div>
          
          {list.creator && (
            <div className="flex items-center text-xs text-gray-500">
              <User className="h-3 w-3 mr-1" />
              {list.creator}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ListCard;