import React from 'react';
import { ListChecks } from 'lucide-react';
import Link from 'next/link';

interface RestaurantListsSectionProps {
  lists: any[];
  restaurantId: string;
}

export default function RestaurantListsSection({
  lists,
  restaurantId
}: RestaurantListsSectionProps) {
  
  if (!lists || lists.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-4">
        <div className="flex items-center mb-3 sm:mb-4">
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-full p-2 sm:p-3 mr-3 sm:mr-4">
            <ListChecks className="h-5 w-5 sm:h-6 w-6 text-gray-400" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Listas que incluem este restaurante</h3>
            <p className="text-xs sm:text-sm text-gray-500">Este restaurante não está em nenhuma lista.</p>
          </div>
        </div>
        
        <div className="text-center py-6">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
            <ListChecks className="h-6 w-6 sm:h-8 w-8 text-gray-300" />
          </div>
          <p className="text-gray-500 text-xs sm:text-sm">
            Adicione este restaurante a uma lista para organizá-lo melhor!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-4">
      <div className="flex items-center mb-3 sm:mb-4">
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-full p-2 sm:p-3 mr-3 sm:mr-4">
          <ListChecks className="h-5 w-5 sm:h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">Listas que incluem este restaurante</h3>
          <p className="text-xs sm:text-sm text-gray-500">{lists.length} lista{lists.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {lists.map((list) => (
          <Link 
            key={list.id} 
            href={`/lists/${list.id}`}
            className="block group"
          >
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all duration-200 group-hover:scale-105 group-active:scale-95">
              <div className="flex items-start justify-between gap-2 sm:gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                    {list.name}
                  </h4>
                  {list.description && (
                    <p className="text-xs text-gray-600 line-clamp-3">
                      {list.description}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg className="h-4 w-4 sm:h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              
              {/* List Stats */}
              <div className="mt-2 sm:mt-3 flex items-center gap-2 sm:gap-3 text-xs text-gray-500">
                <span className="bg-white px-1 sm:px-2 py-0.5 sm:py-1 rounded-full border border-gray-200">
                  {list.restaurants_count || 0} restaurantes
                </span>
                {list.created_at && (
                  <span className="bg-white px-1 sm:px-2 py-0.5 sm:py-1 rounded-full border border-gray-200">
                    Criada em {new Date(list.created_at).toLocaleDateString('pt-PT')}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
