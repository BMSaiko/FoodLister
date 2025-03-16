import React, { useState } from 'react';
import Link from 'next/link';
import SearchBar from './Searchbar';

const Navbar = () => {
  const [activeSection, setActiveSection] = useState('restaurants');

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
            <button
              onClick={() => setActiveSection('restaurants')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeSection === 'restaurants' 
                  ? 'bg-white shadow-sm text-indigo-600' 
                  : 'text-gray-600 hover:text-indigo-500'
              }`}
            >
              Restaurants
            </button>
            <button
              onClick={() => setActiveSection('lists')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeSection === 'lists' 
                  ? 'bg-white shadow-sm text-indigo-600' 
                  : 'text-gray-600 hover:text-indigo-500'
              }`}
            >
              Lists
            </button>
          </div>
          
          {/* Barra de pesquisa */}
          <SearchBar searchType={activeSection} />
        </div>

        {/* Espaço para botões adicionais futuros (login, etc) */}
        <div className="w-32 flex justify-end">
          {/* Conteúdo futuro */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;