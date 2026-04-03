// components/ui/ListCard.tsx (versão responsiva)
import React from 'react';
import Link from 'next/link';
import { Utensils, User, Globe, Lock } from 'lucide-react';
import type { List } from '@/libs/types';

const ListCard = ({ list, restaurantCount = 0 }: { list: List; restaurantCount?: number }) => {
  return (
    <Link href={`/lists/${list.id}`}>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 p-4 sm:p-5 h-full w-full flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div className="bg-amber-100 rounded-full p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
            <Utensils className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
          </div>
          
          {/* Privacy indicator */}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
            (list as any).is_public !== false 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {(list as any).is_public !== false ? (
              <><Globe className="h-3 w-3" /> Pública</>
            ) : (
              <><Lock className="h-3 w-3" /> Privada</>
            )}
          </span>
        </div>
        
        <h3 className="font-bold text-base sm:text-lg text-gray-800 line-clamp-1">{list.name}</h3>
        <p className="text-gray-600 mt-2 flex-grow text-sm sm:text-base line-clamp-3">{list.description}</p>
        
        <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 sm:gap-0">
          <div className="text-xs sm:text-sm text-gray-500">
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
