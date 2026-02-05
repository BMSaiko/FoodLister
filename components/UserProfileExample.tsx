import React from 'react';
import { useUserDataV2 } from '../hooks/useUserDataV2';

interface UserProfileExampleProps {
  userId: string;
}

export const UserProfileExample: React.FC<UserProfileExampleProps> = ({ userId }) => {
  const {
    profile,
    reviews,
    lists,
    restaurants,
    loading,
    error,
    accessLevel,
    isOwnProfile,
    canViewPrivateData,
    refreshProfile,
    refreshReviews,
    refreshLists
  } = useUserDataV2({
    userId,
    enableReviews: true,
    enableLists: true,
    enableRestaurants: false,
    autoFetch: true
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Carregando perfil...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold">Erro ao carregar perfil</h3>
        <p className="text-red-600 text-sm">{error}</p>
        <button 
          onClick={refreshProfile}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Perfil não encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header do Perfil */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4">
          {profile.profileImage ? (
            <img 
              src={profile.profileImage} 
              alt={profile.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-600">
                {profile.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
            <p className="text-gray-600">{profile.location}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
              <span>#{profile.userIdCode}</span>
              <span>•</span>
              <span>Desde {new Date(profile.createdAt).getFullYear()}</span>
              {isOwnProfile && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  Seu Perfil
                </span>
              )}
            </div>
          </div>
        </div>

        {profile.bio && (
          <div className="mt-4">
            <p className="text-gray-700">{profile.bio}</p>
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {profile.stats.totalRestaurantsVisited}
            </div>
            <div className="text-sm text-gray-600">Restaurantes Visitados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {profile.stats.totalReviews}
            </div>
            <div className="text-sm text-gray-600">Avaliações</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {profile.stats.totalLists}
            </div>
            <div className="text-sm text-gray-600">Listas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {profile.stats.totalRestaurantsAdded}
            </div>
            <div className="text-sm text-gray-600">Restaurantes Criados</div>
          </div>
        </div>
      </div>

      {/* Conteúdo baseado no nível de acesso */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Avaliações */}
        {canViewPrivateData && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Avaliações Recentes</h2>
              <button 
                onClick={refreshReviews}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Atualizar
              </button>
            </div>
            
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{review.restaurant.name}</span>
                      <span className="text-yellow-600">⭐ {review.rating}/5</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                    <div className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Nenhuma avaliação encontrada</p>
            )}
          </div>
        )}

        {/* Listas */}
        {canViewPrivateData && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Listas Recentes</h2>
              <button 
                onClick={refreshLists}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Atualizar
              </button>
            </div>
            
            {lists.length > 0 ? (
              <div className="space-y-4">
                {lists.slice(0, 3).map((list) => (
                  <div key={list.id} className="border-b border-gray-200 pb-4">
                    <div className="font-medium">{list.name}</div>
                    <p className="text-sm text-gray-600 mb-2">{list.description}</p>
                    <div className="text-xs text-gray-500">
                      {list.restaurantCount} restaurantes • {new Date(list.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Nenhuma lista encontrada</p>
            )}
          </div>
        )}

        {/* Mensagem de acesso restrito */}
        {!canViewPrivateData && (
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {accessLevel === 'PUBLIC' ? 'Perfil Público' : 'Acesso Restrito'}
              </h3>
              <p className="text-gray-600">
                {accessLevel === 'PUBLIC' 
                  ? 'Este perfil é público, mas algumas informações são restritas a usuários logados.'
                  : 'Para ver avaliações e listas, faça login ou registre-se.'}
              </p>
              {accessLevel === 'PUBLIC' && (
                <div className="mt-4 text-sm text-gray-500">
                  Nível de acesso: Visitante não logado
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Informações de Debug */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm text-gray-600">
          <span className="font-mono bg-white px-2 py-1 rounded">accessLevel: {accessLevel}</span>
          <span className="ml-2 font-mono bg-white px-2 py-1 rounded">isOwnProfile: {isOwnProfile ? 'true' : 'false'}</span>
          <span className="ml-2 font-mono bg-white px-2 py-1 rounded">canViewPrivateData: {canViewPrivateData ? 'true' : 'false'}</span>
        </div>
      </div>
    </div>
  );
};