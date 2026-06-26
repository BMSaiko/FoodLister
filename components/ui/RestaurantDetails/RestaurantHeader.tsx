import React from 'react';
import { Star, Share2, Calendar, Edit, Check, X, Plus } from 'lucide-react';
import { Restaurant } from '@/libs/types';
import { getRatingClass, formatPrice, categorizePriceLevel } from '@/utils/formatters';

interface RestaurantHeaderProps {
  restaurant: Restaurant;
  onShare: () => void;
  onSchedule: () => void;
  onEdit?: () => void;
  user?: any;
  showActions?: boolean;
  visited?: boolean;
  onToggleVisited?: () => void;
  isUpdating?: boolean;
}

export default function RestaurantHeader({
  restaurant,
  onShare,
  onSchedule,
  onEdit,
  user,
  showActions = true,
  visited = false,
  onToggleVisited,
  isUpdating = false,
}: RestaurantHeaderProps) {
  const ratingClass = getRatingClass(restaurant.rating || 0);
  const priceCategory = categorizePriceLevel(restaurant.price_per_person || 0);

  const renderPriceLevel = () => {
    return (
      <div className="flex items-center mt-3 bg-white/[0.03] p-3 rounded-xl ring-1 ring-white/10">
        <div className="flex items-center">
          {Array(priceCategory.level).fill(0).map((_, i) => (
            <span key={i} className="h-4 w-4 text-amber-500">{'\u20ac'}</span>
          ))}
          {Array(4 - priceCategory.level).fill(0).map((_, i) => (
            <span key={i + priceCategory.level} className="h-4 w-4 text-white/20">{'\u20ac'}</span>
          ))}
        </div>
        <span className="ml-2 text-sm text-amber-500 font-bold">{priceCategory.label}</span>
        <div className="ml-auto text-amber-500 font-semibold">
          {formatPrice(restaurant.price_per_person || 0)}
          <span className="text-sm text-white/40 ml-1">por pessoa</span>
        </div>
      </div>
    );
  };


  return (
    <div id="restaurant-header" className="rounded-2xl overflow-hidden mb-4 bg-white/[0.03] border border-white/[0.06]">
      <div className="p-4 sm:p-6 border-b border-white/[0.06]">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
              {restaurant.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {restaurant.rating !== null && restaurant.rating !== undefined && (
                <div className={`flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20`}>
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 mr-1 text-amber-400" fill="currentColor" />
                  <span className={`font-semibold text-sm sm:text-lg ${ratingClass}`}>
                    {(restaurant.rating || 0).toFixed(1)}
                  </span>
                </div>
              )}
              {restaurant.creator_name && (
                <div className="flex items-center text-white/60 text-xs sm:text-sm">
                  <span className="mr-1">{'\u2022'}</span>
                  Por: <span className="font-medium ml-1">{restaurant.creator_name}</span>
                </div>
              )}
              {restaurant.created_at && (
                <div className="flex items-center text-white/40 text-xs sm:text-sm">
                  <span className="mr-1">{'\u2022'}</span>
                  <span>Adicionado em {new Date(restaurant.created_at).toLocaleDateString('pt-PT')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {showActions && (
              <div className="flex items-center gap-3">
                <button
                  onClick={onShare}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.05] text-white/70 ring-1 ring-white/10 rounded-full hover:bg-white/[0.08] transition-colors duration-150 text-sm font-medium min-h-[44px]"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Compartilhar</span>
                </button>
                <button
                  onClick={onSchedule}
                  className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-black rounded-full hover:bg-amber-400 transition-colors duration-150 text-sm font-medium min-h-[44px]"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Agendar Refeicao</span>
                </button>
                {user && restaurant?.creator_id === user.id && onEdit && (
                  <button
                    onClick={onEdit}
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-black rounded-full hover:bg-amber-400 transition-colors duration-150 text-sm font-medium min-h-[44px]"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Editar</span>
                  </button>
                )}
              </div>
            )}
            <div className="flex items-center gap-4 justify-end w-full">
              </div>
          </div>
        </div>
      </div>

      {restaurant.price_per_person && restaurant.price_per_person > 0 && (
        <div className="p-4 sm:p-6">
          {renderPriceLevel()}
        </div>
      )}
    </div>
  );
}
