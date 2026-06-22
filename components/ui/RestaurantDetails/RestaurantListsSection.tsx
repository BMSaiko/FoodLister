import React from 'react';
import { ListChecks } from 'lucide-react';
import Link from 'next/link';
import HorizontalImageList from './HorizontalImageList';

interface RestaurantListsSectionProps {
  lists: any[];
  restaurantId: string;
  menuImages?: string[];
}

export default function RestaurantListsSection({
  lists,
  restaurantId,
  menuImages
}: RestaurantListsSectionProps) {

  if (!lists || lists.length === 0) {
    return (
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 sm:p-6 mb-4">
        <div className="flex items-center mb-3 sm:mb-4">
          <div className="bg-white/[0.05] rounded-full p-2 sm:p-3 mr-3 sm:mr-4">
            <ListChecks className="h-5 w-5 sm:h-6 w-6 text-white/30" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white/70">Listas</h3>
            <p className="text-xs sm:text-sm text-white/40">Este restaurante nao esta em nenhuma lista.</p>
          </div>
        </div>

        <div className="text-center py-6">
          <div className="bg-white/[0.03] rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <ListChecks className="h-6 w-6 text-white/20" />
          </div>
          <p className="text-white/40 text-xs sm:text-sm">
            Adicione este restaurante a uma lista para organiza-lo melhor!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 sm:p-6 mb-4">
      {menuImages && menuImages.length > 0 && (
        <HorizontalImageList
          images={menuImages}
          title="Imagens do Menu"
          className="mb-6"
        />
      )}

      <div className="flex items-center mb-3 sm:mb-4">
        <div className="bg-amber-500/10 rounded-full p-2 sm:p-3 mr-3 sm:mr-4">
          <ListChecks className="h-5 w-5 sm:h-6 w-6 text-amber-400" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white">Listas com este restaurante</h3>
          <p className="text-xs sm:text-sm text-white/40">{lists.length} lista{lists.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="space-y-2">
        {lists.map((list) => (
          <Link
            key={list.id}
            href={'/lists/' + list.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] ring-1 ring-white/10 hover:bg-white/[0.05] transition-colors duration-150"
          >
            <div className="bg-amber-500/10 rounded-lg p-2">
              <ListChecks className="h-4 w-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80 truncate">{list.name}</p>
              {list.description && (
                <p className="text-xs text-white/40 truncate">{list.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
