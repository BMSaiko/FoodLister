import React, { useState, useEffect } from 'react';
import { Star, Utensils, Clock, MapPin, Euro, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useSecureApiClient } from '@/hooks/auth/useSecureApiClient';
import { formatDate } from '@/utils/formatters';
import { 
  ProfileCard, 
  RatingBadge, 
  PriceLevelBadge, 
  LocationBadge, 
  CuisineBadge, 
  DateBadge,
  TouchButton,
  SkeletonLoader,
  EmptyState 
} from '../shared';

interface UserRestaurantsSectionProps {
  userId: string;
  initialRestaurants: Array<{
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    location?: string;
    priceLevel?: number;
    rating?: number;
    createdAt: string;
    cuisineTypes: string[];
    dietaryOptions: string[];
    features: string[];
  }>;
  initialTotal: number;
  isOwnProfile: boolean;
}

const UserRestaurantsSection: React.FC<UserRestaurantsSectionProps> = ({
  userId,
  initialRestaurants,
  initialTotal,
  isOwnProfile
}) => {
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [total, setTotal] = useState(initialTotal);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialRestaurants.length < initialTotal);

  const { get } = useSecureApiClient();

  const loadMoreRestaurants = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const response = await get(`/api/users/${userId}/restaurants?page=${page + 1}&limit=10`);
      const data = await response.json();

      if (response.ok) {
        setRestaurants(prev => [...prev, ...data.data]);
        setTotal(data.total);
        setPage(data.page);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Error loading more restaurants:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (restaurants.length === 0) {
    return (
      <EmptyState
        icon={<Utensils className="h-8 w-8 text-gray-400" />}
        title="Nenhum restaurante encontrado"
        description={isOwnProfile 
          ? 'Você ainda não adicionou nenhum restaurante. Comece a explorar e adicionar seus restaurantes favoritos!'
          : 'Este usuário ainda não adicionou nenhum restaurante.'
        }
        action={isOwnProfile ? {
          label: 'Explorar restaurantes',
          onClick: () => window.location.href = '/restaurants',
          icon: <Utensils className="h-4 w-4" />
        } : undefined}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
        {restaurants.map((restaurant) => (
          <ProfileCard
            key={restaurant.id}
            className="touch-space"
            href={`/restaurants/${restaurant.id}`}
            hoverEffect={true}
            touchTarget={true}
          >
            {/* Restaurant Header */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-4">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-3">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                    {restaurant.name}
                  </h3>
                  {restaurant.rating && (
                    <RatingBadge rating={restaurant.rating} type="restaurant" />
                  )}
                  <PriceLevelBadge priceLevel={restaurant.priceLevel} />
                </div>
                
                {restaurant.description && (
                  <p className="text-gray-700 text-sm line-clamp-2 mb-3 ios-safe-padding-bottom">
                    {restaurant.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {restaurant.location && (
                    <LocationBadge location={restaurant.location} />
                  )}
                  {restaurant.cuisineTypes.length > 0 && (
                    <CuisineBadge cuisineType={restaurant.cuisineTypes[0]} />
                  )}
                  <DateBadge date={restaurant.createdAt} prefix="Adicionado em" />
                </div>
              </div>
              
              {restaurant.imageUrl && (
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 touch-target">
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
            </div>

            {/* Restaurant Details */}
            <div className="flex flex-wrap gap-2">
              {restaurant.cuisineTypes.length > 0 && (
                <span className="px-2 py-1 bg-white rounded-full text-xs sm:text-sm text-gray-600 border border-gray-200">
                  Tipos: {restaurant.cuisineTypes.join(', ')}
                </span>
              )}
              {restaurant.dietaryOptions.length > 0 && (
                <span className="px-2 py-1 bg-white rounded-full text-xs sm:text-sm text-gray-600 border border-gray-200">
                  Opções: {restaurant.dietaryOptions.join(', ')}
                </span>
              )}
              {restaurant.features.length > 0 && (
                <span className="px-2 py-1 bg-white rounded-full text-xs sm:text-sm text-gray-600 border border-gray-200">
                  Recursos: {restaurant.features.join(', ')}
                </span>
              )}
            </div>
          </ProfileCard>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <TouchButton
            onClick={loadMoreRestaurants}
            loading={isLoadingMore}
            variant="primary"
            size="md"
            disabled={isLoadingMore}
            icon={isLoadingMore ? undefined : <Utensils className="h-4 w-4" />}
            fullWidth={false}
          >
            {isLoadingMore ? 'Carregando...' : 'Carregar mais restaurantes'}
          </TouchButton>
        </div>
      )}

      {/* Total Count */}
      {total > restaurants.length && (
        <div className="text-center text-gray-500 text-sm ios-safe-padding-top">
          Mostrando {restaurants.length} de {total} restaurantes
        </div>
      )}
    </div>
  );
};

export default UserRestaurantsSection;
