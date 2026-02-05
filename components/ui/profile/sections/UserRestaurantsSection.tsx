import React, { useState, useEffect } from 'react';
import { Star, Utensils, Clock, MapPin, Euro, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useSecureApiClient } from '@/hooks/auth/useSecureApiClient';
import { formatDate } from '@/utils/formatters';

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
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialRestaurants.length < initialTotal);

  const { get } = useSecureApiClient();

  const loadMoreRestaurants = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
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
      setLoading(false);
    }
  };

  const formatPriceLevel = (priceLevel?: number) => {
    if (!priceLevel) return null;
    return '$'.repeat(priceLevel);
  };

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Utensils className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhum restaurante encontrado</h3>
        <p className="text-gray-600">
          {isOwnProfile 
            ? 'Você ainda não adicionou nenhum restaurante. Comece a explorar e adicionar seus restaurantes favoritos!'
            : 'Este usuário ainda não adicionou nenhum restaurante.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {restaurants.map((restaurant) => (
          <Link
            key={restaurant.id}
            href={`/restaurants/${restaurant.id}`}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:shadow-md hover:shadow-amber-100/50 transition-all duration-200 group hover:-translate-y-1"
          >
            {/* Restaurant Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                    {restaurant.name}
                  </h3>
                  {restaurant.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500 fill-current" />
                      <span className="text-sm font-semibold text-gray-700">{restaurant.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {restaurant.priceLevel && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">{formatPriceLevel(restaurant.priceLevel)}</span>
                    </div>
                  )}
                </div>
                
                {restaurant.description && (
                  <p className="text-gray-700 text-sm line-clamp-2 mb-3">{restaurant.description}</p>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {restaurant.location && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                      <MapPin className="h-3 w-3 mr-1" />
                      {restaurant.location}
                    </span>
                  )}
                  {restaurant.cuisineTypes.length > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                      <Utensils className="h-3 w-3 mr-1" />
                      {restaurant.cuisineTypes[0]}
                    </span>
                  )}
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                    <Clock className="h-3 w-3 mr-1" />
                    Adicionado em {formatDate(restaurant.createdAt)}
                  </span>
                </div>
              </div>
              
              {restaurant.imageUrl && (
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Restaurant Details */}
            <div className="flex flex-wrap gap-2">
              {restaurant.cuisineTypes.length > 0 && (
                <span className="px-2 py-1 bg-white rounded-full text-xs text-gray-600 border border-gray-200">
                  Tipos: {restaurant.cuisineTypes.join(', ')}
                </span>
              )}
              {restaurant.dietaryOptions.length > 0 && (
                <span className="px-2 py-1 bg-white rounded-full text-xs text-gray-600 border border-gray-200">
                  Opções: {restaurant.dietaryOptions.join(', ')}
                </span>
              )}
              {restaurant.features.length > 0 && (
                <span className="px-2 py-1 bg-white rounded-full text-xs text-gray-600 border border-gray-200">
                  Recursos: {restaurant.features.join(', ')}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <button
            onClick={loadMoreRestaurants}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Carregando...
              </>
            ) : (
              <>
                <Utensils className="h-4 w-4" />
                Carregar mais restaurantes
              </>
            )}
          </button>
        </div>
      )}

      {/* Total Count */}
      {total > restaurants.length && (
        <div className="text-center text-gray-500 text-sm">
          Mostrando {restaurants.length} de {total} restaurantes
        </div>
      )}
    </div>
  );
};

export default UserRestaurantsSection;