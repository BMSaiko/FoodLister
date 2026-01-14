// components/layouts/Navbar.tsx (versão responsiva)
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBar from './Searchbar';
import NavbarActions from './NavbarActions';
import { Utensils, Menu, X } from 'lucide-react';

const Navbar = ({ clearFilters = null }) => {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState('restaurants');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
            href="/"
            className="flex items-center text-lg sm:text-xl font-bold text-amber-500 flex-shrink-0"
            onClick={(e) => {
              if (clearFilters && (pathname === '/' || pathname === '/restaurants')) {
                e.preventDefault();
                clearFilters();
              }
            }}
          >
            <Utensils className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
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

          {/* Botões de ações (criar restaurante/lista) */}
          <div className="flex justify-end flex-shrink-0">
            <NavbarActions activeSection={activeSection} />
          </div>
        </div>

        {/* Versão mobile */}
        <div className="md:hidden flex items-center justify-between gap-2">
          <Link
            href="/"
            className="flex items-center text-lg font-bold text-amber-500 flex-shrink-0"
            onClick={(e) => {
              if (clearFilters && (pathname === '/' || pathname === '/restaurants')) {
                e.preventDefault();
                clearFilters();
              }
            }}
          >
            <Utensils className="h-5 w-5 mr-1.5" />
            <span className="whitespace-nowrap">FoodLister</span>
          </Link>
          
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
              <NavbarActions activeSection={activeSection} />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
