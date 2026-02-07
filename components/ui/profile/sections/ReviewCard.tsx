// components/ui/profile/sections/ReviewCard.tsx
"use client";

import React from 'react';
import { Star, MapPin, Euro, Clock, MessageCircle } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { convertCloudinaryUrl } from '@/utils/cloudinaryConverter';
import { TouchButton } from '../shared';
import ReviewCardHeader from './ReviewCardHeader';
import ReviewCardFooter from './ReviewCardFooter';
import ReviewCardActions from './ReviewCardActions';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment?: string;
    amountSpent?: number;
    createdAt: string;
    restaurant: {
      id: string;
      name: string;
      imageUrl?: string;
      images?: string[];
      display_image_index?: number;
      location?: string;
      price_per_person?: number;
      rating?: number;
    };
  };
  isOwnReview: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  editingReviewId?: string | null;
  editingData?: {
    rating: number;
    comment: string;
    amountSpent: number;
  };
  onEditChange?: (field: string, value: any) => void;
  onSaveEdit?: (e: React.MouseEvent) => void;
  onCancelEdit?: (e: React.MouseEvent) => void;
  className?: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  isOwnReview,
  onEdit,
  onDelete,
  onShare,
  editingReviewId,
  editingData,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  className = ''
}) => {
  const isEditing = editingReviewId === review.id;
  const hasImage = review.restaurant.imageUrl || (review.restaurant.images && review.restaurant.images.length > 0);

  // Function to categorize price level
  const categorizePriceLevel = (price: number) => {
    if (price <= 10) return { label: 'Econômico', level: 1 };
    if (price <= 20) return { label: 'Moderado', level: 2 };
    if (price <= 50) return { label: 'Elevado', level: 3 };
    return { label: 'Luxo', level: 4 };
  };

  // Get color class based on price level
  const getPriceColorClass = (level: number): string => {
    switch(level) {
      case 1: return 'text-amber-400';
      case 2: return 'text-amber-500';
      case 3: return 'text-amber-600';
      case 4: return 'text-amber-800';
      default: return 'text-amber-400';
    }
  };

  const getPriceLabelClass = (level: number): string => {
    switch(level) {
      case 1: return 'text-amber-400 font-bold';
      case 2: return 'text-amber-500 font-bold';
      case 3: return 'text-amber-600 font-bold';
      case 4: return 'text-amber-800 font-bold';
      default: return 'text-amber-400 font-medium';
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if we're in edit mode or if clicking on interactive elements
    if (isEditing) return;
    
    // Check if the click target is an interactive element
    const target = e.target as HTMLElement;
    const interactiveElements = ['button', 'a', 'input', 'textarea', 'select'];
    
    if (interactiveElements.includes(target.tagName.toLowerCase()) || 
        target.closest('button') || 
        target.closest('a')) {
      return;
    }

    // Navigate to restaurant page with review parameter
    window.location.href = `/restaurants/${review.restaurant.id}?review=${review.id}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow keyboard navigation for accessibility
    if (e.key === 'Enter' || e.key === ' ') {
      if (!isEditing) {
        e.preventDefault();
        window.location.href = `/restaurants/${review.restaurant.id}?review=${review.id}`;
      }
    }
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return null;
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 group ${className}`}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`Avaliação de ${review.restaurant.name} - ${review.rating.toFixed(1)}/5 estrelas`}
    >
      {/* Restaurant Image Section - Clickable for navigation */}
      <div 
        className="relative h-72 sm:h-80 lg:h-96 w-full min-w-[280px] max-w-[380px] sm:max-w-[500px] lg:max-w-[600px] min-h-[288px] sm:min-h-[320px] lg:min-h-[384px] aspect-[4/3] sm:aspect-[16/9] cursor-pointer group-hover:scale-[1.02] transition-transform duration-200"
        onClick={handleCardClick}
      >
        {hasImage ? (
          <img
            src={convertCloudinaryUrl(review.restaurant.imageUrl || (review.restaurant.images && review.restaurant.images[0]) || '')}
            alt={review.restaurant.name}
            className="w-full h-full object-cover"
            style={{
              minWidth: '100%',
              minHeight: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <Star className="h-12 w-12 text-gray-400" />
          </div>
        )}

        {/* Restaurant Rating Badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded ${getPriceLabelClass(categorizePriceLevel(review.restaurant.rating || 0).level)}`}>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3" fill="currentColor" />
            <span className="font-semibold text-xs">{(review.restaurant.rating || review.rating).toFixed(1)}/5</span>
          </div>
        </div>

        {/* Restaurant Name Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
              {review.restaurant.name}
            </h3>
          </div>
        </div>

        {/* Review Actions - Positioned over the image */}
        <ReviewCardActions
          review={review}
          isOwnReview={isOwnReview}
          onEdit={onEdit}
          onDelete={onDelete}
          onShare={onShare}
          className="absolute top-3 right-3"
        />
      </div>

      {/* Content Area */}
      <div className="p-4" onClick={handleCardClick}>
        {isEditing ? (
          // Edit Mode - Not clickable for redirection
          <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avaliação
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditChange?.('rating', star);
                    }}
                    className="text-2xl transition-colors"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= (editingData?.rating || 0)
                          ? 'text-amber-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600 font-medium">
                  {(editingData?.rating || 0)}/5
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentário
              </label>
              <textarea
                value={editingData?.comment || ''}
                onChange={(e) => {
                  e.stopPropagation();
                  onEditChange?.('comment', e.target.value);
                }}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                placeholder="Descreva sua experiência..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Gasto (EUR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">€</span>
                <input
                  type="number"
                  value={editingData?.amountSpent || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    onEditChange?.('amountSpent', parseFloat(e.target.value) || 0);
                  }}
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <TouchButton
                onClick={(e) => {
                  e.stopPropagation();
                  onCancelEdit?.(e);
                }}
                variant="secondary"
                size="sm"
              >
                Cancelar
              </TouchButton>
              <TouchButton
                onClick={(e) => {
                  e.stopPropagation();
                  onSaveEdit?.(e);
                }}
                variant="primary"
                size="sm"
              >
                Salvar
              </TouchButton>
            </div>
          </div>
        ) : (
          // View Mode - Clickable for redirection
          <div>
            {/* Review Footer - Positioned above the comment */}
            <ReviewCardFooter 
              review={review} 
              centered={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;