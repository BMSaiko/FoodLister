import React, { useState, useEffect } from 'react';
import { Share2, Calendar, Edit, Check, X, Plus, ArrowUp, ArrowDown } from 'lucide-react';

interface RestaurantStickyNavbarProps {
  visited: boolean;
  visitCount: number;
  onShare: () => void;
  onSchedule: () => void;
  onEdit?: () => void;
  onToggleVisited: () => void;
  onAddVisit: () => void;
  onRemoveVisit: () => void;
  isUpdating: boolean;
  loadingVisits: boolean;
  user?: any;
  restaurant?: any;
}

export default function RestaurantStickyNavbar({
  visited,
  visitCount,
  onShare,
  onSchedule,
  onEdit,
  onToggleVisited,
  onAddVisit,
  onRemoveVisit,
  isUpdating,
  loadingVisits,
  user,
  restaurant
}: RestaurantStickyNavbarProps) {
  
  // State for scroll direction and visibility
  const [isAtTop, setIsAtTop] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Create intersection observers for top and reviews sections
    const topObserver = new IntersectionObserver(
      ([entry]) => {
        setIsAtTop(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      }
    );

    const reviewsObserver = new IntersectionObserver(
      ([entry]) => {
        // Show scroll button when we're not at the top and not at reviews
        setIsVisible(!entry.isIntersecting && !isAtTop);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      }
    );

    // Observe the header (top section)
    const header = document.getElementById('restaurant-header');
    if (header) {
      topObserver.observe(header);
    }

    // Observe the reviews section
    const reviews = document.getElementById('restaurant-reviews');
    if (reviews) {
      reviewsObserver.observe(reviews);
    }

    // Also listen to scroll events for better responsiveness
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsAtTop(scrollTop < 100); // Consider "at top" if scrolled less than 100px
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      topObserver.disconnect();
      reviewsObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isAtTop]);

  const handleScrollAction = () => {
    if (isAtTop) {
      // Scroll to reviews section
      const reviews = document.getElementById('restaurant-reviews');
      if (reviews) {
        reviews.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // Fallback: scroll down by viewport height
        window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
      }
    } else {
      // Check if we're below the reviews section
      const reviews = document.getElementById('restaurant-reviews');
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (reviews) {
        const reviewsRect = reviews.getBoundingClientRect();
        const reviewsTop = reviewsRect.top + scrollTop;
        
        // If we're significantly below the reviews section, scroll to reviews
        if (scrollTop > reviewsTop + 200) {
          reviews.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          // Otherwise, scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        // Fallback to top if no reviews section found
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
      <div className="max-w-md mx-auto px-4 py-2">
        {/* Scrollable container for all buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {/* Left side: Smart Scroll Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Smart Scroll Button */}
            <button
              onClick={handleScrollAction}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 transform hover:scale-110 ${
                isVisible
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-100 text-gray-400 shadow-sm'
              } ${isAtTop ? 'animate-bounce' : ''}`}
              aria-label={isAtTop ? 'Ir para avaliações' : 'Voltar ao topo'}
              title={isAtTop ? 'Ir para avaliações' : 'Voltar ao topo'}
            >
              {isAtTop ? (
                <ArrowDown className="h-5 w-5" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Middle: Visit controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Visit Counter with Switch Button */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-full px-3 py-2 border border-amber-200">
              {/* Switch Button replacing "Visitas" text */}
              <button
                onClick={onToggleVisited}
                disabled={isUpdating || loadingVisits}
                className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  loadingVisits
                    ? 'bg-gray-200 text-gray-400 animate-pulse'
                    : visited
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
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
                  <div className="h-3 w-3 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
                ) : visited ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <X className="h-3 w-3" />
                )}
                <span>{visited ? 'Visitado' : 'Não visitado'}</span>
              </button>
              
              {/* Show visit count and controls only if visited */}
              {visited && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={onRemoveVisit}
                    disabled={visitCount <= 0 || !visited}
                    className="flex items-center justify-center w-6 h-6 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                    title="Remover -1 visita"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <span className="text-sm font-bold text-amber-700 tabular-nums min-w-[20px] text-center">
                    {visitCount}
                  </span>
                  <button
                    onClick={onAddVisit}
                    disabled={!visited}
                    className="flex items-center justify-center w-6 h-6 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-full transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Adicionar +1 visita"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right side: Action buttons - made scrollable */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onShare}
              className="flex items-center justify-center w-12 h-12 bg-white text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md"
              aria-label="Compartilhar"
            >
              <Share2 className="h-5 w-5" />
            </button>
            
            <button
              onClick={onSchedule}
              className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full hover:bg-blue-600 active:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
              aria-label="Agendar refeição"
            >
              <Calendar className="h-5 w-5" />
            </button>
            
            {user && restaurant?.creator_id === user.id && onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center justify-center w-12 h-12 bg-amber-500 text-white rounded-full hover:bg-amber-600 active:bg-amber-700 transition-all duration-200 shadow-md hover:shadow-lg"
                aria-label="Editar restaurante"
              >
                <Edit className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
