// components/ui/ListCard.tsx
import React from 'react';
import Link from 'next/link';
import { Utensils, User, Globe, Lock, ArrowRight } from 'lucide-react';
import type { List } from '@/libs/types';

const ListCard = ({ list, restaurantCount = 0 }: { list: List; restaurantCount?: number }) => {
  const isPublic = (list as any).is_public !== false;
  const createdDate = new Date(list.created_at).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <Link href={`/lists/${list.id}`} className="group block h-full">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full w-full flex flex-col border border-gray-100">
        {/* Top section with icon and badge */}
        <div className="p-4 sm:p-5 pb-0">
          <div className="flex justify-between items-start mb-3">
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-3 w-12 h-12 flex items-center justify-center shadow-sm">
              <Utensils className="h-5 w-5 text-amber-600" />
            </div>
            
            {/* Privacy indicator */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${
              isPublic 
                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' 
                : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700'
            }`}>
              {isPublic ? (
                <><Globe className="h-3 w-3" /> Pública</>
              ) : (
                <><Lock className="h-3 w-3" /> Privada</>
              )}
            </span>
          </div>
        </div>
        
        {/* Content section */}
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex-grow flex flex-col">
          <h3 className="font-bold text-base sm:text-lg text-gray-800 line-clamp-1 group-hover:text-amber-600 transition-colors">
            {list.name}
          </h3>
          <p className="text-gray-500 mt-2 flex-grow text-sm sm:text-base line-clamp-2 leading-relaxed">
            {list.description || 'Sem descrição'}
          </p>
          
          {/* Bottom section with stats */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  {restaurantCount} {restaurantCount === 1 ? 'restaurante' : 'restaurantes'}
                </span>
                <span className="text-gray-400">•</span>
                <span>{createdDate}</span>
              </div>
              
              {list.creator && (
                <div className="flex items-center text-xs text-gray-500">
                  <User className="h-3 w-3 mr-1 text-gray-400" />
                  <span className="truncate max-w-[120px]">{list.creator}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Hover indicator */}
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
          <div className="flex items-center text-amber-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Ver lista <ArrowRight className="h-4 w-4 ml-1" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListCard;