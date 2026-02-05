import React, { useState, useEffect } from 'react';
import { List, Utensils, Clock, Users, MapPin, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useSecureApiClient } from '@/hooks/auth/useSecureApiClient';
import { formatDate } from '@/utils/formatters';
import { 
  ProfileCard, 
  ListIconBadge, 
  RestaurantCountBadge, 
  DateBadge,
  TouchButton,
  SkeletonLoader,
  EmptyState 
} from '../shared';

interface UserListsSectionProps {
  userId: string;
  initialLists: Array<{
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    restaurantCount: number;
  }>;
  initialTotal: number;
  isOwnProfile: boolean;
}

const UserListsSection: React.FC<UserListsSectionProps> = ({
  userId,
  initialLists,
  initialTotal,
  isOwnProfile
}) => {
  const [lists, setLists] = useState(initialLists);
  const [total, setTotal] = useState(initialTotal);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialLists.length < initialTotal);

  const { get } = useSecureApiClient();

  const loadMoreLists = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const response = await get(`/api/users/${userId}/lists?page=${page + 1}&limit=10`);
      const data = await response.json();

      if (response.ok) {
        setLists(prev => [...prev, ...data.data]);
        setTotal(data.total);
        setPage(data.page);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Error loading more lists:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (lists.length === 0) {
    return (
      <EmptyState
        icon={<List className="h-8 w-8 text-gray-400" />}
        title="Nenhuma lista encontrada"
        description={isOwnProfile 
          ? 'Você ainda não criou nenhuma lista. Comece a organizar seus restaurantes favoritos!'
          : 'Este usuário ainda não criou nenhuma lista.'
        }
        action={isOwnProfile ? {
          label: 'Criar primeira lista',
          onClick: () => window.location.href = '/lists/create',
          icon: <List className="h-4 w-4" />
        } : undefined}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
        {lists.map((list) => (
          <ProfileCard
            key={list.id}
            className="touch-space"
            href={`/lists/${list.id}`}
            hoverEffect={true}
            touchTarget={true}
          >
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <ListIconBadge count={list.restaurantCount} />
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                    {list.name}
                  </h3>
                </div>
                
                {list.description && (
                  <p className="text-gray-700 text-sm line-clamp-3 mb-3 ios-safe-padding-bottom">
                    {list.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-gray-600">
                  <RestaurantCountBadge count={list.restaurantCount} />
                  <DateBadge date={list.createdAt} prefix="Criada em" />
                </div>
              </div>
              
              <div className="flex items-center touch-target">
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start sm:items-center justify-between">
              <RestaurantCountBadge count={list.restaurantCount} />
              <div className="text-sm text-gray-500">
                Ver lista completa
              </div>
            </div>
          </ProfileCard>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <TouchButton
            onClick={loadMoreLists}
            loading={isLoadingMore}
            variant="primary"
            size="md"
            disabled={isLoadingMore}
            icon={isLoadingMore ? undefined : <List className="h-4 w-4" />}
            fullWidth={false}
          >
            {isLoadingMore ? 'Carregando...' : 'Carregar mais listas'}
          </TouchButton>
        </div>
      )}

      {/* Total Count */}
      {total > lists.length && (
        <div className="text-center text-gray-500 text-sm ios-safe-padding-top">
          Mostrando {lists.length} de {total} listas
        </div>
      )}
    </div>
  );
};

export default UserListsSection;
