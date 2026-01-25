// components/layouts/Navbar.tsx (versão responsiva)
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import SearchBar from './Searchbar';
import NavbarActions from './NavbarActions';
import { Menu, X, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth, useFilters } from '@/contexts';
import { getClient } from '@/libs/supabase/client';

// Define the profile data interface
interface ProfileData {
  display_name: string;
  avatar_url: string;
}

const Navbar = ({ clearFilters = null }) => {
  const { user, signOut, loading } = useAuth();
  const { clearFilters: clearFiltersFromContext } = useFilters();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getClient();
  const [activeSection, setActiveSection] = useState<'restaurants' | 'lists'>('restaurants');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);
  
  // Fetch user profile data when user changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user && !loading) {
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', user.id)
            .single();

          if (!error && profileData) {
            setUserProfile(profileData);
          } else {
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Error fetching user profile for navbar:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, [user, loading, supabase]);

  // Determina a seção ativa com base na URL atual
  useEffect(() => {
    if (pathname.includes('/lists')) {
      setActiveSection('lists');
    } else if (pathname.includes('/restaurants')) {
      setActiveSection('restaurants');
    } else {
      // Na página inicial, mantém a seleção atual ou define um padrão
      setActiveSection(activeSection || 'restaurants');
    }
  }, [pathname]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
        {/* Versão desktop */}
        <div className="hidden md:flex md:items-center md:justify-between md:gap-4">
          {/* Logo/Nome do site */}
          <Link
            href="/restaurants"
            className="flex items-center text-lg sm:text-xl font-bold text-amber-500 flex-shrink-0"
            onClick={(e) => {
              if (pathname === '/' || pathname === '/restaurants') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 sm:h-6 sm:w-6 mr-2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>
            <span className="whitespace-nowrap">FoodLister</span>
          </Link>

          {/* Seção central com botões e pesquisa */}
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 justify-center max-w-2xl">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Link href="/restaurants">
                <button
                  className={`px-3 sm:px-4 py-2 rounded-md transition-colors text-sm sm:text-base min-h-[40px] ${
                    activeSection === 'restaurants' 
                      ? 'bg-white shadow-sm text-amber-500' 
                      : 'text-gray-600 hover:text-amber-500'
                  }`}
                >
                  Restaurantes
                </button>
              </Link>
              <Link href="/lists">
                <button
                  className={`px-3 sm:px-4 py-2 rounded-md transition-colors text-sm sm:text-base min-h-[40px] ${
                    activeSection === 'lists' 
                      ? 'bg-white shadow-sm text-amber-500' 
                      : 'text-gray-600 hover:text-amber-500'
                  }`}
                >
                  Listas
                </button>
              </Link>
            </div>
            
            {/* Barra de pesquisa */}
            <div className="flex-1 max-w-md">
              <SearchBar searchType={activeSection} />
            </div>
          </div>

          {/* Botões de ações e menu do usuário */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Botão de criar */}
            <NavbarActions activeSection={activeSection} showLogin={true} showSignout={false} />

            {/* Menu do usuário (apenas se logado) */}
            {user && !loading && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 transition-colors min-h-[40px]"
                  title="Menu do usuário"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                    {userProfile?.avatar_url ? (
                      <img
                        src={userProfile.avatar_url}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-xs font-semibold">
                        {(userProfile?.display_name || user.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown do usuário */}
                {userMenuOpen && (
                  <>
                    {/* Overlay para fechar ao clicar fora */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-20 animate-in slide-in-from-top-2 duration-200">
                      {/* Header com avatar e informações */}
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-sm">
                            {userProfile?.avatar_url ? (
                              <img
                                src={userProfile.avatar_url}
                                alt="Avatar"
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white text-sm font-semibold">
                                {(userProfile?.display_name || user.email || 'U').charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {userProfile?.display_name || user.email?.split('@')[0] || 'Usuário'}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Options */}
                      <div className="py-2">
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-4 px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-800 transition-colors active:bg-amber-100"
                        >
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Settings className="h-4 w-4 text-amber-600" />
                          </div>
                          <p className="font-medium">Configurações</p>
                        </Link>

                        <button
                          onClick={async () => {
                            setUserMenuOpen(false);
                            // Clear all filters before logout
                            clearFiltersFromContext();
                            // Sign out and redirect to root page
                            await signOut();
                            router.push('/');
                          }}
                          className="flex items-center gap-4 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors active:bg-red-100"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                            <LogOut className="h-4 w-4 text-red-600" />
                          </div>
                          <p className="font-medium">Sair</p>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Versão mobile */}
        <div className="md:hidden flex items-center justify-between">
          <Link
            href="/restaurants"
            className="flex items-center text-lg font-bold text-amber-500 flex-shrink-0"
            onClick={(e) => {
              if (pathname === '/' || pathname === '/restaurants') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-1.5"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>
            <span className="whitespace-nowrap">FoodLister</span>
          </Link>

          <div className="flex items-center gap-1">
            {!user && !loading && (
              <Link href="/auth/signin">
                <button className="flex items-center justify-center bg-amber-500 text-white px-3 py-2 rounded-md hover:bg-amber-600 active:bg-amber-700 transition-colors min-h-[44px] min-w-[44px] text-sm font-medium">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Entrar</span>
                </button>
              </Link>
            )}
            {user && !loading && (
              <>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 transition-colors min-h-[44px]"
                  title="Menu do usuário"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                    {userProfile?.avatar_url ? (
                      <img
                        src={userProfile.avatar_url}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-xs font-semibold">
                        {(userProfile?.display_name || user.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </button>

                {/* Dropdown do usuário - Mobile */}
                {userMenuOpen && (
                  <>
                    {/* Overlay para fechar ao clicar fora */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-2 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-20 animate-in slide-in-from-top-2 duration-200">
                      {/* Header com avatar e informações */}
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-sm">
                            {userProfile?.avatar_url ? (
                              <img
                                src={userProfile.avatar_url}
                                alt="Avatar"
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white text-lg font-semibold">
                                {(userProfile?.display_name || user.email || 'U').charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {userProfile?.display_name || user.email?.split('@')[0] || 'Usuário'}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Options */}
                      <div className="py-2">
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center justify-center w-full px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-800 transition-colors active:bg-amber-100"
                          title="Configurações"
                        >
                          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Settings className="h-5 w-5 text-amber-600" />
                          </div>
                        </Link>

                        <button
                          onClick={async () => {
                            setUserMenuOpen(false);
                            // Clear all filters before logout
                            clearFiltersFromContext();
                            // Sign out and redirect to root page
                            await signOut();
                            router.push('/');
                          }}
                          className="flex items-center justify-center w-full px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors active:bg-red-100"
                          title="Sair"
                        >
                          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                            <LogOut className="h-5 w-5 text-red-600" />
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-amber-500 hover:text-amber-600 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile expandido */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pb-3 space-y-3 border-t border-gray-200 pt-3">
            <div className="flex bg-gray-100 rounded-lg p-1 justify-center">
              <Link href="/restaurants" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <button
                  className={`w-full px-4 py-2.5 rounded-md transition-colors text-sm min-h-[44px] ${
                    activeSection === 'restaurants' 
                      ? 'bg-white shadow-sm text-amber-500' 
                      : 'text-gray-600 hover:text-amber-500'
                  }`}
                >
                  Restaurantes
                </button>
              </Link>
              <Link href="/lists" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <button
                  className={`w-full px-4 py-2.5 rounded-md transition-colors text-sm min-h-[44px] ${
                    activeSection === 'lists' 
                      ? 'bg-white shadow-sm text-amber-500' 
                      : 'text-gray-600 hover:text-amber-500'
                  }`}
                >
                  Listas
                </button>
              </Link>
            </div>
            
            <div className="px-1">
              <SearchBar searchType={activeSection} />
            </div>
            
            <div className="flex justify-center px-1">
              <NavbarActions activeSection={activeSection} showLogin={false} showSignout={false} />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
