// components/ui/profile/sections/ReviewCardActions.tsx
"use client";

import React, { useState } from 'react';
import { MapPin, Share2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts';
import { useModal } from '@/contexts/ModalContext';

interface ReviewCardActionsProps {
  review: {
    id: string;
    restaurant: {
      id: string;
      name: string;
      location?: string;
      latitude?: number;
      longitude?: number;
      source_url?: string;
    };
  };
  isOwnReview: boolean;
  onShare?: (e: React.MouseEvent) => void;
  className?: string;
}

const ReviewCardActions: React.FC<ReviewCardActionsProps> = ({ 
  review, 
  isOwnReview,
  onShare,
  className = ''
}) => {
  const { user } = useAuth();
  const { openMapModal } = useModal();
  const [isSharing, setIsSharing] = useState(false);
  const restaurant = review.restaurant || null;

  const handleOpenMapModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!restaurant) return;

    if (restaurant.location || (restaurant.latitude && restaurant.longitude)) {
      openMapModal({
        location: restaurant.location || '',
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        source_url: restaurant.source_url
      });
    }
  };

  const handleShareReview = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsSharing(true);
    
    try {
      const restaurantId = restaurant?.id;
      const restaurantName = restaurant?.name || 'Restaurante';
      const reviewUrl = `${window.location.origin}/restaurants/${restaurantId}?review=${review.id}`;
      
      if (navigator.share && !navigator.userAgent.includes('Firefox')) {
        try {
          await navigator.share({
            title: `Avaliação de ${restaurantName} - FoodList`,
            text: `Confira minha avaliação deste restaurante no FoodList!`,
            url: reviewUrl,
          });
        } catch (error) {
          // Fallback to clipboard if share fails
          await navigator.clipboard.writeText(reviewUrl);
          toast.success('Link da avaliação copiado!');
        }
      } else {
        await navigator.clipboard.writeText(reviewUrl);
        toast.success('Link da avaliação copiado!');
      }
      
      if (onShare) {
        onShare(e);
      }
    } catch (error) {
      toast.error('Erro ao compartilhar avaliação');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className={`absolute top-3 right-3 flex flex-col gap-2 ${className}`}>
      {/* Map Button - Available for all users */}
      {restaurant?.location && (
        <button
          onClick={handleOpenMapModal}
          className="bg-white/[0.08] hover:bg-white/[0.12] p-2 rounded-full transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-1"
          title="Abrir mapa"
        >
          <MapPin className="h-4 w-4 text-gray-600" />
          <span className="text-xs font-medium hidden sm:inline text-gray-600">Mapa</span>
        </button>
      )}

      {/* Share Button - Available for all users */}
      <button
        onClick={handleShareReview}
        disabled={isSharing}
        className={`bg-white/[0.08] hover:bg-white/[0.12] p-2 rounded-full transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-1 ${
          isSharing ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={isSharing ? 'Compartilhando...' : 'Compartilhar avaliação'}
      >
        {isSharing ? (
          <div className="h-4 w-4 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
        ) : (
          <Share2 className="h-4 w-4 text-gray-600" />
        )}
        <span className="text-xs font-medium hidden sm:inline text-gray-600">
          {isSharing ? 'Compartilhando' : 'Compartilhar'}
        </span>
      </button>
    </div>
  );
};

export default ReviewCardActions;
