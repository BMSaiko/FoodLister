'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { useSecureApiClient } from '@/hooks/auth/useSecureApiClient';
import { toast } from 'react-toastify';
import { 
  Search, 
  User, 
  MapPin, 
  Calendar, 
  Star, 
  List, 
  Filter, 
  Users, 
  Eye, 
  EyeOff, 
  Copy, 
  Share2,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageCircle,
  Camera,
  Shield,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/ui/navigation/Navbar';

interface UserSearchResult {
  id: string;
  name: string;
  profileImage?: string;
  location?: string;
  bio?: string;
  userIdCode: string;
  publicProfile: boolean;
  totalRestaurantsVisited: number;
  totalReviews: number;
  totalLists: number;
  createdAt: string;
}

interface UserSearchContentProps {
  searchParams: URLSearchParams;
}

const UserSearchContent = ({ searchParams }: UserSearchContentProps) => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [minReviewsFilter, setMinReviewsFilter] = useState('');
  const [maxReviewsFilter, setMaxReviewsFilter] = useState('');
  const [minListsFilter, setMinListsFilter] = useState('');
  const [maxListsFilter, setMaxListsFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('reviews');

  const { get } = useSecureApiClient();

  // Initialize animations
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  // Load search params
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const location = searchParams.get('location') || '';
    const minReviews = searchParams.get('minReviews') || '';
    const maxReviews = searchParams.get('maxReviews') || '';
    const minLists = searchParams.get('minLists') || '';
    const maxLists = searchParams.get('maxLists') || '';
    const sort = searchParams.get('sort') || 'reviews';

    setSearchQuery(q);
    setLocationFilter(location);
    setMinReviewsFilter(minReviews);
    setMaxReviewsFilter(maxReviews);
    setMinListsFilter(minLists);
    setMaxListsFilter(maxLists);
    setSortBy(sort);

    if (q || location || minReviews || maxReviews || minLists || maxLists) {
      performSearch(q, location, minReviews, maxReviews, minLists, maxLists, sort, 1);
    }
  }, [searchParams]);

  const performSearch = async (
    q: string = searchQuery,
    location: string = locationFilter,
    minReviews: string = minReviewsFilter,
    maxReviews: string = maxReviewsFilter,
    minLists: string = minListsFilter,
    maxLists: string = maxListsFilter,
    sort: string = sortBy,
    pageNum: number = 1
  ) => {
    if (!q.trim() && !location.trim() && !minReviews && !maxReviews && !minLists && !maxLists) {
      setUsers([]);
      setTotal(0);
      setHasMore(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (location.trim()) params.set('location', location.trim());
      if (minReviews) params.set('minReviews', minReviews);
      if (maxReviews) params.set('maxReviews', maxReviews);
      if (minLists) params.set('minLists', minLists);
      if (maxLists) params.set('maxLists', maxLists);
      params.set('page', pageNum.toString());
      params.set('limit', '12');
      params.set('sort', sort);

      const response = await get(`/api/users/search?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        if (pageNum === 1) {
          setUsers(data.data);
        } else {
          setUsers(prev => [...prev, ...data.data]);
        }
        setTotal(data.total);
        setPage(data.page);
        setHasMore(data.hasMore);
      } else {
        toast.error(data.error || 'Erro ao buscar usuários');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Erro ao buscar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery, locationFilter, minReviewsFilter, maxReviewsFilter, minListsFilter, maxListsFilter, sortBy, 1);
    
    // Update URL
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (locationFilter.trim()) params.set('location', locationFilter.trim());
    if (minReviewsFilter) params.set('minReviews', minReviewsFilter);
    if (maxReviewsFilter) params.set('maxReviews', maxReviewsFilter);
    if (minListsFilter) params.set('minLists', minListsFilter);
    if (maxListsFilter) params.set('maxLists', maxListsFilter);
    params.set('sort', sortBy);
    
    router.push(`/users/search?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setLocationFilter('');
    setMinReviewsFilter('');
    setMaxReviewsFilter('');
    setMinListsFilter('');
    setMaxListsFilter('');
    setSortBy('reviews');
    setUsers([]);
    setTotal(0);
    setHasMore(false);
    
    router.push('/users/search');
  };

  const formatJoinedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPrivacyStatus = (publicProfile: boolean) => {
    if (publicProfile) {
      return { icon: Eye, text: 'Público', color: 'text-green-600' };
    } else {
      return { icon: EyeOff, text: 'Privado', color: 'text-red-600' };
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Buscando usuários...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Floating decorative elements */}
      <div className="absolute inset-0 opacity-80 pointer-events-none">
        <div className={`absolute top-10 left-5 w-16 h-16 bg-amber-600 rounded-full animate-float-slow transition-all duration-1000 ${isVisible ? 'translate-y-0' : 'translate-y-10'} will-change-transform`}></div>
        <User className={`absolute top-28 right-6 w-6 h-6 text-amber-900 animate-bounce-subtle transition-all duration-1000 delay-700 drop-shadow-lg ${isVisible ? 'scale-100' : 'scale-0'} will-change-transform`} />
        <List className={`absolute bottom-20 right-4 w-5 h-5 text-orange-800 animate-bounce-subtle transition-all duration-1000 delay-1500 drop-shadow-lg ${isVisible ? 'translate-x-0' : 'translate-x-5'} will-change-transform`} />
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className={`mb-6 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Buscar Usuários</h1>
              <p className="text-gray-600 mt-2">Encontre outros amantes de gastronomia</p>
            </div>
            
            <Link href="/restaurants" className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors">
              <Search className="h-4 w-4" />
              <span>Buscar Restaurantes</span>
            </Link>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Procure por nome, bio ou interesses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filtros Avançados</span>
                  {showFilters ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white px-4 py-3 rounded-lg hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Buscar
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Localização</label>
                    <input
                      type="text"
                      placeholder="Cidade, país..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Avaliações (mínimo)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={minReviewsFilter}
                      onChange={(e) => setMinReviewsFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Listas (mínimo)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={minListsFilter}
                      onChange={(e) => setMinListsFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Avaliações (máximo)</label>
                    <input
                      type="number"
                      placeholder="999"
                      value={maxReviewsFilter}
                      onChange={(e) => setMaxReviewsFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Listas (máximo)</label>
                    <input
                      type="number"
                      placeholder="999"
                      value={maxListsFilter}
                      onChange={(e) => setMaxListsFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Ordenar por</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    >
                      <option value="reviews">Mais avaliações</option>
                      <option value="lists">Mais listas</option>
                      <option value="visited">Mais visitados</option>
                      <option value="recent">Mais recentes</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Results */}
        <div className={`transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {/* Search Info */}
          {(searchQuery || locationFilter || minReviewsFilter || maxReviewsFilter || minListsFilter || maxListsFilter) && (
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold text-gray-800">Resultados da Busca</h2>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {total} usuário{total !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleClearFilters}
                    className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Limpar busca
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                {searchQuery && (
                  <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                    Busca: "{searchQuery}"
                  </span>
                )}
                {locationFilter && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Localização: {locationFilter}
                  </span>
                )}
                {(minReviewsFilter || maxReviewsFilter) && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Avaliações: {minReviewsFilter || '0'} - {maxReviewsFilter || '∞'}
                  </span>
                )}
                {(minListsFilter || maxListsFilter) && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    Listas: {minListsFilter || '0'} - {maxListsFilter || '∞'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Users Grid */}
          {users.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => {
                const PrivacyIcon = getPrivacyStatus(user.publicProfile).icon;
                
                return (
                  <Link
                    key={user.id}
                    href={`/users/${user.id}`}
                    className="block bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                  >
                    {/* Profile Header */}
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 shadow-xl flex items-center justify-center overflow-hidden ring-4 ring-white group-hover:ring-amber-200 transition-all duration-300">
                            {user.profileImage ? (
                              <img
                                src={user.profileImage}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="h-8 w-8 text-white opacity-80" />
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                              {user.name}
                            </h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              {user.userIdCode}
                            </span>
                            <PrivacyIcon className={`h-4 w-4 ${getPrivacyStatus(user.publicProfile).color}`} />
                          </div>
                          
                          {user.bio && (
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">{user.bio}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-2">
                            {user.location && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                <MapPin className="h-3 w-3 mr-1" />
                                {user.location}
                              </span>
                            )}
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                              <Calendar className="h-3 w-3 mr-1" />
                              Membro desde {formatJoinedDate(user.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                        <div className="text-center">
                          <div className="text-lg font-bold text-amber-600">{user.totalRestaurantsVisited}</div>
                          <div className="text-xs text-gray-500">Visitados</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">{user.totalReviews}</div>
                          <div className="text-xs text-gray-500">Avaliações</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-yellow-600">{user.totalLists}</div>
                          <div className="text-xs text-gray-500">Listas</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            !loading && (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum usuário encontrado</h3>
                <p className="text-gray-600 mb-8">
                  {searchQuery || locationFilter || minReviewsFilter || maxReviewsFilter || minListsFilter || maxListsFilter
                    ? 'Tente ajustar seus filtros de busca.'
                    : 'Comece a buscar por nomes, localizações ou interesses.'
                  }
                </p>
                
                <div className="space-y-4">
                  <Link href="/restaurants" className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors">
                    <Search className="h-5 w-5" />
                    <span>Explorar Restaurantes</span>
                  </Link>
                  
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={() => {
                        setSearchQuery('comida');
                        performSearch('comida', '', '', '', '', '', 'reviews', 1);
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Buscar por "comida"
                    </button>
                    <button
                      onClick={() => {
                        setSearchQuery('gastronomia');
                        performSearch('gastronomia', '', '', '', '', '', 'reviews', 1);
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Buscar por "gastronomia"
                    </button>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-8">
              <button
                onClick={() => performSearch(searchQuery, locationFilter, minReviewsFilter, maxReviewsFilter, minListsFilter, maxListsFilter, sortBy, page + 1)}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Carregar mais usuários
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearchContent;