// components/ui/profile/sections/ReviewCardHeader.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import { Star, MapPin, Euro, Tag } from 'lucide-react';
import { convertCloudinaryUrl } from '@/utils/cloudinaryConverter';

interface ReviewCardHeaderProps {
  review: {
    rating: number;
    restaurant: {
      name: string;
      imageUrl?: string;
      images?: string[];
      display_image_index?: number;
      location?: string;
      price_per_person?: number;
      rating?: number; // Restaurant's actual rating
      cuisine_types?: Array<{ id: string; name: string }>;
    };
  };
  centered?: boolean;
}

const ReviewCardHeader: React.FC<ReviewCardHeaderProps> = ({ 
  review, 
  centered = false 
}) => {
  // Determine display image: use carousel display image if available, fallback to legacy image_url
  const getDisplayImage = () => {
    // If restaurant has images array and display_image_index is valid
    if (review.restaurant.images && review.restaurant.images.length > 0) {
      if (review.restaurant.display_image_index !== undefined && 
          review.restaurant.display_image_index >= 0 &&
          review.restaurant.display_image_index < review.restaurant.images.length) {
        // Use the specified display image
        return convertCloudinaryUrl(review.restaurant.images[review.restaurant.display_image_index]);
      } else if (review.restaurant.images.length > 0) {
        // Use first image as fallback
        return convertCloudinaryUrl(review.restaurant.images[0]);
      }
    }
    // Fallback to legacy image_url
    return convertCloudinaryUrl(review.restaurant.imageUrl || '');
  };

  const imageUrl = getDisplayImage();
  const hasImage = imageUrl && imageUrl !== '/placeholder-restaurant.jpg' && imageUrl !== '';

  // Style of rating based on value
  const getRatingStyle = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-100 text-green-700';
    if (rating >= 3.5) return 'bg-amber-100 text-amber-700';
    if (rating >= 2.5) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };
  
  // Use restaurant's actual rating for the header, fallback to review rating if not available
  const restaurantRating = review.restaurant.rating ?? review.rating;
  const ratingStyle = getRatingStyle(restaurantRating || 0);

  return (
    <div className="relative h-72 sm:h-80 lg:h-96 w-full min-w-[280px] max-w-[380px] sm:max-w-[500px] lg:max-w-[600px] min-h-[288px] sm:min-h-[320px] lg:min-h-[384px] aspect-[4/3] sm:aspect-[16/9]">
      {hasImage ? (
        <Image
          src={imageUrl}
          alt={review.restaurant.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
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

      {/* Restaurant Rating Badge - shows the restaurant's actual rating */}
      <div className={`absolute top-3 left-3 px-2 py-1 rounded ${ratingStyle}`}>
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3" fill="currentColor" />
          <span className="font-semibold text-xs">{restaurantRating.toFixed(1)}/5</span>
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
    </div>
  );
};

export default ReviewCardHeader;