'use client';

import React, { Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
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
import Navbar from '@/components/layouts/Navbar';
import SearchParamsWrapper from './SearchParamsWrapper';
import UserSearchContent from './UserSearchContent';

const UserSearchPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
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
        <div className="absolute top-10 left-5 w-16 h-16 bg-amber-600 rounded-full animate-float-slow transition-all duration-1000 translate-y-0 will-change-transform"></div>
        <User className="absolute top-28 right-6 w-6 h-6 text-amber-900 animate-bounce-subtle transition-all duration-1000 delay-700 drop-shadow-lg scale-100 will-change-transform" />
        <List className="absolute bottom-20 right-4 w-5 h-5 text-orange-800 animate-bounce-subtle transition-all duration-1000 delay-1500 drop-shadow-lg translate-x-0 will-change-transform" />
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="mb-6 transition-all duration-1000 translate-y-0 opacity-100">
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
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Procure por nome, bio ou interesses..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filtros Avançados</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white px-4 py-3 rounded-lg hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <Search className="h-4 w-4" />
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="transition-all duration-1000 translate-y-0 opacity-100">
          <Suspense fallback={
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando...</p>
            </div>
          }>
            <SearchParamsWrapper>
              {(searchParams) => <UserSearchContent searchParams={searchParams} />}
            </SearchParamsWrapper>
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default UserSearchPage;