'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Search, CookingPot } from 'lucide-react';

interface EmptyStateProps {
  searchQuery: string | null;
}

export const EmptyState = React.memo<EmptyStateProps>(({ searchQuery }) => {
  // Se há uma pesquisa, mostra mensagem de "nenhum resultado"
  if (searchQuery) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-6 sm:py-12 px-4">
        <div className="text-center max-w-md">
          <Search className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum resultado encontrado</h3>
          <p className="text-gray-500 mb-6 text-sm sm:text-base">
            Não encontramos nenhum restaurante que corresponda a "{searchQuery}".
          </p>
          <Link href="/restaurants" className="text-amber-600 hover:text-amber-800 font-medium">
            Limpar pesquisa
          </Link>
        </div>
      </div>
    );
  }

  // Se não há pesquisa, mostra mensagem para criar primeiro restaurante
  return (
    <div className="w-full flex flex-col items-center justify-center py-6 sm:py-12 px-4">
      <div className="text-center max-w-md">
        <CookingPot className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum restaurante cadastrado</h3>
        <p className="text-gray-500 mb-6 text-sm sm:text-base">
          Comece adicionando seu primeiro restaurante para criar sua coleção gastronômica.
        </p>
        <Link
          href="/restaurants/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Restaurante
        </Link>
      </div>
    </div>
  );
});
