// components/layouts/Navbar.tsx (versão responsiva)
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBar from './Searchbar';
import NavbarActions from './NavbarActions';
import { Utensils, Menu, X } from 'lucide-react';

const Navbar = () => {
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
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        {/* Versão desktop */}
        <div className="hidden md:flex md:items-center md:justify-between">
          {/* Logo/Nome do site */}
          <Link href="/" className="flex items-center text-xl font-bold text-amber-500">
            <Utensils className="h-6 w-6 mr-2" />
            FoodLister
          </Link>

          {/* Seção central com botões e pesquisa */}
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Link href="/restaurants">
                <button
                  className={`px-4 py-2 rounded-md transition-colors ${
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
                  className={`px-4 py-2 rounded-md transition-colors ${
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
            <SearchBar searchType={activeSection} />
          </div>

          {/* Botões de ações (criar restaurante/lista) */}
          <div className="flex justify-end">
            <NavbarActions activeSection={activeSection} />
          </div>
        </div>

        {/* Versão mobile */}
        <div className="md:hidden flex items-center justify-between">
          <Link href="/" className="flex items-center text-xl font-bold text-amber-500">
            <Utensils className="h-6 w-6 mr-2" />
            FoodLister
          </Link>
          
          <button 
            onClick={toggleMobileMenu}
            className="p-2 text-amber-500 hover:text-amber-600 focus:outline-none"
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
          <div className="md:hidden mt-3 pb-3 space-y-4">
            <div className="flex bg-gray-100 rounded-lg p-1 justify-center">
              <Link href="/restaurants">
                <button
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeSection === 'restaurants' 
                      ? 'bg-white shadow-sm text-amber-500' 
                      : 'text-gray-600 hover:text-amber-500'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Restaurantes
                </button>
              </Link>
              <Link href="/lists">
                <button
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeSection === 'lists' 
                      ? 'bg-white shadow-sm text-amber-500' 
                      : 'text-gray-600 hover:text-amber-500'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Listas
                </button>
              </Link>
            </div>
            
            <div className="px-2">
              <SearchBar searchType={activeSection} />
            </div>
            
            <div className="flex justify-center">
              <NavbarActions activeSection={activeSection} />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;