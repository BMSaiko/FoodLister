// components/ui/profile/sections/ReviewCardActions.tsx
"use client";

import React, { useState } from 'react';
import { MapPin, Edit, Trash2, Share2, Copy } from 'lucide-react';
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
    };
  };
  isOwnReview: boolean;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onShare?: (e: React.MouseEvent) => void;
  className?: string;
}

const ReviewCardActions: React.FC<ReviewCardActionsProps> = ({ 
  review, 
  isOwnReview, 
  onEdit, 
  onDelete, 
  onShare,
  className = ''
}) => {
  const { user } = useAuth();
  const { openMapModal } = useModal();
  const [isSharing, setIsSharing] = useState(false);

  const handleOpenMapModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only open map modal if location data is available
    if (review.restaurant.location || (review.restaurant.latitude && review.restaurant.longitude)) {
      openMapModal({
        location: review.restaurant.location || '',
        latitude: review.restaurant.latitude,
        longitude: review.restaurant.longitude
      });
    }
  };

  const handleShareReview = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsSharing(true);
    
    try {
      const reviewUrl = `${window.location.origin}/restaurants/${review.restaurant.id}?review=${review.id}`;
      
      if (navigator.share && !navigator.userAgent.includes('Firefox')) {
        try {
          await navigator.share({
            title: `Avaliação de ${review.restaurant.name} - FoodList`,
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

  const handleDeleteReview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onDelete) return;
    
    const confirmDelete = window.confirm(
      'Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.'
    );
    
    if (confirmDelete) {
      onDelete(e);
    }
  };

  const handleEditReview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onEdit) {
      onEdit(e);
    }
  };

  return (
    <div className={`absolute top-3 right-3 flex flex-col gap-2 ${className}`}>
      {/* Map Button - Available for all users */}
      {review.restaurant.location && (
        <button
          onClick={handleOpenMapModal}
          className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-md transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-1"
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
        className={`bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-md transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-1 ${
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

      {/* Edit Button - only for authenticated users who own the review */}
      {user && isOwnReview && onEdit && (
        <button
          onClick={handleEditReview}
          className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-md transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-1"
          title="Editar avaliação"
        >
          <Edit className="h-4 w-4 text-amber-600" />
          <span className="text-xs font-medium hidden sm:inline text-amber-600">Editar</span>
        </button>
      )}

      {/* Delete Button - only for authenticated users who own the review */}
      {user && isOwnReview && onDelete && (
        <button
          onClick={handleDeleteReview}
          className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-md transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-1"
          title="Excluir avaliação"
        >
          <Trash2 className="h-4 w-4 text-red-600" />
          <span className="text-xs font-medium hidden sm:inline text-red-600">Excluir</span>
        </button>
      )}
    </div>
  );
};

export default ReviewCardActions;