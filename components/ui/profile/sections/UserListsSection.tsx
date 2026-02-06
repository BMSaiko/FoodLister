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
      const response = await get(`/api/users/${userId}/lists?page=${page + 1}&limit=12`);
      const data = await response.json();

      if (response.ok) {
        // Filter out any duplicate lists by ID to prevent React key conflicts
        const newLists = data.data.filter((newList: any) => 
          !lists.some(existingList => existingList.id === newList.id)
        );
        
        setLists(prev => [...prev, ...newLists]);
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
            {/* List Header with Icon */}
            <div className="relative h-48 sm:h-56 lg:h-64 w-full rounded-t-xl overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100">
              <div className="w-full h-full flex items-center justify-center">
                <ListIconBadge count={list.restaurantCount} />
              </div>
            </div>

            {/* Content Area */}
            <div className="p-4 flex-grow">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                  {list.name}
                </h3>
              </div>
              
              {list.description && (
                <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                  {list.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-gray-600">
                <RestaurantCountBadge count={list.restaurantCount} />
                <DateBadge date={list.createdAt} prefix="Criada em" />
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start sm:items-center justify-between mt-4">
                <RestaurantCountBadge count={list.restaurantCount} />
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Ver lista completa</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
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
