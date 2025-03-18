// components/layouts/SearchBar.tsx (versão responsiva)
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

const SearchBar = ({ searchType }) => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Redireciona para a página de resultados com a query como parâmetro
    if (searchType === 'restaurants') {
      router.push(`/restaurants?search=${encodeURIComponent(query)}`);
    } else {
      router.push(`/lists?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full md:w-auto">
      <input
        type="text"
        placeholder={`Procurar ${searchType === 'restaurants' ? 'restaurantes' : 'listas'}...`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-gray-100 pl-10 pr-4 py-2 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-amber-300"
      />
      <button 
        type="submit" 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        aria-label="Buscar"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
};

export default SearchBar;