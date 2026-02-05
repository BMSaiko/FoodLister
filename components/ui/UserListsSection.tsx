import React, { useState, useEffect } from 'react';
import { List, Utensils, Clock, Users, MapPin, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useSecureApiClient } from '@/hooks/useSecureApiClient';
import { formatDate } from '@/utils/formatters';

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
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialLists.length < initialTotal);

  const { get } = useSecureApiClient();

  const loadMoreLists = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
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
      setLoading(false);
    }
  };

  if (lists.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <List className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhuma lista encontrada</h3>
        <p className="text-gray-600">
          {isOwnProfile 
            ? 'Você ainda não criou nenhuma lista. Comece a organizar seus restaurantes favoritos!'
            : 'Este usuário ainda não criou nenhuma lista.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {lists.map((list) => (
          <Link
            key={list.id}
            href={`/lists/${list.id}`}
            className="block bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:shadow-md hover:shadow-amber-100/50 transition-all duration-200 group hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-amber-500 text-white p-2 rounded-lg">
                    <List className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                    {list.name}
                  </h3>
                </div>
                
                {list.description && (
                  <p className="text-gray-700 text-sm line-clamp-3 mb-3">
                    {list.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Utensils className="h-4 w-4 text-amber-600" />
                    <span>{list.restaurantCount} restaurantes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Criada em {formatDate(list.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
              </div>
            </div>

            {/* Restaurant Count Badge */}
            <div className="flex items-center justify-between">
              <div className="bg-white rounded-lg px-3 py-1 border border-gray-200">
                <span className="text-sm font-medium text-gray-700">
                  {list.restaurantCount} restaurantes
                </span>
              </div>
              
              <div className="text-sm text-gray-500">
                Ver lista completa
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <button
            onClick={loadMoreLists}
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
                <List className="h-4 w-4" />
                Carregar mais listas
              </>
            )}
          </button>
        </div>
      )}

      {/* Total Count */}
      {total > lists.length && (
        <div className="text-center text-gray-500 text-sm">
          Mostrando {lists.length} de {total} listas
        </div>
      )}
    </div>
  );
};

export default UserListsSection;