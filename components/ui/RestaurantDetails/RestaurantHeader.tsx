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
  visitCount?: number;
  onToggleVisited?: () => void;
  onAddVisit?: () => void;
  onRemoveVisit?: () => void;
  isUpdating?: boolean;
  loadingVisits?: boolean;
}

export default function RestaurantHeader({ 
  restaurant, 
  onShare, 
  onSchedule, 
  onEdit, 
  user, 
  showActions = true,
  visited = false,
  visitCount = 0,
  onToggleVisited,
  onAddVisit,
  onRemoveVisit,
  isUpdating = false,
  loadingVisits = false
}: RestaurantHeaderProps) {
  const ratingClass = getRatingClass(restaurant.rating || 0);
  const priceCategory = categorizePriceLevel(restaurant.price_per_person || 0);
  
  // Get color class based on price level
  const getPriceColorClass = (level: number): string => {
    switch(level) {
      case 1: return 'text-primary-light';
      case 2: return 'text-primary';
      case 3: return 'text-primary-hover';
      case 4: return 'text-primary-dark';
      default: return 'text-primary-light';
    }
  };

  const getPriceLabelClass = (level: number): string => {
    switch(level) {
      case 1: return 'text-primary-light font-bold';
      case 2: return 'text-primary font-bold';
      case 3: return 'text-primary-hover font-bold';
      case 4: return 'text-primary-dark font-bold';
      default: return 'text-primary-light font-medium';
    }
  };

  const renderPriceLevel = () => {
    const priceColorClass = getPriceColorClass(priceCategory.level);
    
    return (
      <div className="flex items-center mt-3 bg-[var(--primary-lighter)] p-3 rounded-lg border border-primary">
        <div className="flex items-center">
          {Array(priceCategory.level).fill(0).map((_, i) => (
            <span key={i} className={`h-4 w-4 ${priceColorClass}`}>
              €
            </span>
          ))}
          {Array(4 - priceCategory.level).fill(0).map((_, i) => (
            <span key={i + priceCategory.level} className="h-4 w-4 text-[var(--gray-300)]">
              €
            </span>
          ))}
        </div>
        <span className={`ml-2 text-sm ${getPriceLabelClass(priceCategory.level)}`}>
          {priceCategory.label}
        </span>
          <div className="ml-auto text-primary-hover font-semibold">
            {formatPrice(restaurant.price_per_person || 0)}
            <span className="text-sm text-[var(--foreground-muted)] ml-1">por pessoa</span>
        </div>
      </div>
    );
  };

  // Enhanced visit counter component
  const renderVisitCounter = () => {
    // Only show visit counter if we have the required functions
    if (!onAddVisit || !onRemoveVisit) return null;

    return (
      <div className="flex items-center gap-3 bg-[var(--primary-lighter)] p-3 rounded-lg border border-primary">
        {/* Switch Button replacing "Visitas" text */}
        {onToggleVisited && (
          <button
            onClick={onToggleVisited}
            disabled={isUpdating || loadingVisits}
            className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              loadingVisits
                ? 'bg-[var(--primary-light)] text-[var(--primary-hover)] animate-pulse'
                : visited
                ? 'bg-[var(--success)] text-white hover:bg-[var(--success-hover)]'
                : 'bg-[var(--gray-300)] text-[var(--foreground-secondary)] hover:bg-[var(--gray-400)]'
            } disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg`}
            title={
              loadingVisits
                ? 'Carregando status de visita...'
                : visited
                ? 'Clique para marcar como não visitado'
                : 'Clique para marcar como visitado'
            }
          >
            {loadingVisits ? (
              <div className="h-4 w-4 rounded-full border-2 border-[var(--gray-400)] border-t-transparent animate-spin" />
            ) : visited ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
            <span>{visited ? 'Visitado' : 'Não visitado'}</span>
          </button>
        )}
        
        {/* Show visit count and controls only if visited */}
        {visited && (
          <div className="flex items-center gap-2 bg-[var(--card-bg)] rounded px-3 py-1.5 shadow-sm ml-auto justify-end w-full">
            <button
              onClick={onRemoveVisit}
              disabled={visitCount <= 0 || !visited}
              className="flex items-center justify-center w-8 h-8 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:shadow-md transform hover:scale-110 active:scale-95"
              title="Remover -1 visita"
            >
              <X className="h-4 w-4" />
            </button>
            <span className="text-lg font-bold text-primary-dark tabular-nums min-w-[24px] text-center">
              {visitCount}
            </span>
            <button
              onClick={onAddVisit}
              disabled={!visited}
              className="flex items-center justify-center w-8 h-8 bg-primary hover:bg-primary-hover active:bg-primary-dark text-white rounded-full transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Adicionar +1 visita"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="restaurant-header" className="bg-[var(--card-bg)] rounded-xl shadow-lg border border-[var(--card-border)] overflow-hidden mb-4">
      {/* Restaurant Name and Rating */}
      <div className="p-4 sm:p-6 border-b border-[var(--card-border)]">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--foreground)] mb-2">
                {restaurant.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                {restaurant.rating !== null && restaurant.rating !== undefined && (
                  <div className={`flex items-center ${ratingClass} px-2 py-1 sm:px-3 sm:py-2 rounded-full`}>
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" fill="currentColor" />
                    <span className="font-semibold text-sm sm:text-lg">{(restaurant.rating || 0).toFixed(1)}</span>
                  </div>
                )}
                {restaurant.creator_name && (
                <div className="flex items-center text-[var(--foreground-secondary)] text-xs sm:text-sm">
                    <span className="mr-1">•</span>
                    Por: <span className="font-medium ml-1">{restaurant.creator_name}</span>
                  </div>
                )}
                {restaurant.created_at && (
                  <div className="flex items-center text-[var(--foreground-secondary)] text-xs sm:text-sm">
                    <span className="mr-1">•</span>
                    <span>Adicionado em {new Date(restaurant.created_at).toLocaleDateString('pt-PT')}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Desktop Layout: All buttons aligned to the right of the name */}
            <div className="hidden md:flex flex-col gap-3">
              {/* Main Actions - Top row */}
              {showActions && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={onShare}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--card-bg)] text-[var(--foreground-secondary)] border border-[var(--card-border)] rounded-lg hover:bg-[var(--background-secondary)] active:bg-[var(--background-tertiary)] transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium min-h-[44px]"
                    aria-label="Compartilhar"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Compartilhar</span>
                  </button>
                  
                  <button
                    onClick={onSchedule}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover active:bg-primary-dark transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium min-h-[44px]"
                    aria-label="Agendar refeição"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Agendar Refeição</span>
                  </button>
                  
                  {user && restaurant?.creator_id === user.id && onEdit && (
                    <button
                      onClick={onEdit}
                      className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover active:bg-primary-dark transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium min-h-[44px]"
                      aria-label="Editar restaurante"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Editar</span>
                    </button>
                  )}
                </div>
              )}
              
              {/* Visit Controls - Bottom row */}
              <div className="flex items-center gap-4 justify-end w-full">
                {/* Visit Counter - Desktop (includes switch button) */}
                {renderVisitCounter()}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Price Information */}
      {restaurant.price_per_person && restaurant.price_per_person > 0 && (
        <div className="p-4 sm:p-6">
          {renderPriceLevel()}
        </div>
      )}
    </div>
  );
}
