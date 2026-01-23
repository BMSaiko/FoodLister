// components/layouts/SearchBar.tsx (versão responsiva)
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';

const SearchBar = ({ searchType }) => {
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Redireciona para a página de resultados com a query como parâmetro
      if (searchType === 'restaurants') {
        router.push(`/restaurants?search=${encodeURIComponent(query.trim())}`);
      } else {
        router.push(`/lists?search=${encodeURIComponent(query.trim())}`);
      }
    } catch (error) {
      console.error('Erro ao buscar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    // Handle Enter key press for mobile and desktop
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default form submission to control the flow
      handleSearch(e);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <input
        type="search" // Use search type for better mobile UX
        placeholder={`Procurar ${searchType === 'restaurants' ? 'restaurantes' : 'listas'}...`}
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="bg-gray-100 pl-3 pr-12 py-2.5 sm:py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-amber-300 text-base sm:text-sm min-h-[44px] sm:min-h-[40px] transition-colors"
        disabled={isSubmitting}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
      
      {/* Submit Button */}
      <button 
        type="submit" 
        disabled={isSubmitting || !query.trim()}
        className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${
          isSubmitting || !query.trim() 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-gray-400 hover:text-amber-500 active:scale-95'
        }`}
        aria-label="Buscar"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
        ) : (
          <Search className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </button>
    </form>
  );
};

export default SearchBar;
