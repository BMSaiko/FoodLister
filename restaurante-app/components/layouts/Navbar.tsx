// components/layouts/Navbar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBar from './Searchbar';
import NavbarActions from './NavbarActions';

const Navbar = () => {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState('restaurants');
  
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

  return (
    <nav className="bg-white shadow-md px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo/Nome do site */}
        <Link href="/" className="text-xl font-bold text-indigo-600">
          FoodLister
        </Link>

        {/* Seção central com botões e pesquisa */}
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Link href="/restaurants">
              <button
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeSection === 'restaurants' 
                    ? 'bg-white shadow-sm text-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-500'
                }`}
              >
                Restaurants
              </button>
            </Link>
            <Link href="/lists">
              <button
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeSection === 'lists' 
                    ? 'bg-white shadow-sm text-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-500'
                }`}
              >
                Lists
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
    </nav>
  );
};

export default Navbar;