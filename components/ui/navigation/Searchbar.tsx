// components/layouts/SearchBar.tsx (versão responsiva)
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';

const SearchBar = ({ searchType }: { searchType: 'restaurants' | 'lists' }) => {
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle Enter key press for mobile and desktop
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default form submission
      e.stopPropagation(); // Stop event propagation
      
      // Only trigger search if there's a query
      if (query.trim()) {
        handleSearch(e as any);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full" role="search" aria-label="Pesquisa">
      <input
        type="search"
        placeholder={`Procurar ${searchType === 'restaurants' ? 'restaurantes' : 'listas'}...`}
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="bg-[var(--background-secondary)] pl-3 pr-12 py-2.5 sm:py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-base sm:text-sm min-h-[44px] sm:min-h-[40px] transition-colors"
        disabled={isSubmitting}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        aria-label={`Procurar ${searchType === 'restaurants' ? 'restaurantes' : 'listas'}`}
        aria-describedby="search-hint"
      />
      <span id="search-hint" className="sr-only">
        Pressione Enter para pesquisar. Use Cmd+K para pesquisa global.
      </span>
      
      {/* Submit Button */}
      <button 
        type="submit" 
        disabled={isSubmitting || !query.trim()}
        className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${
          isSubmitting || !query.trim() 
            ? 'text-[var(--gray-300)] cursor-not-allowed' 
            : 'text-[var(--primary)] hover:text-[var(--primary-hover)] active:scale-95'
        }`}
        aria-label="Buscar"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
        ) : (
          <Search className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </button>

      {/* ⌘K shortcut indicator */}
      <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 pointer-events-none" aria-hidden="true">
        <kbd className="px-1.5 py-0.5 rounded bg-[var(--background-secondary)] border border-[var(--gray-200)] text-[var(--foreground-muted)] font-mono text-[10px] leading-none">⌘</kbd>
        <kbd className="px-1.5 py-0.5 rounded bg-[var(--background-secondary)] border border-[var(--gray-200)] text-[var(--foreground-muted)] font-mono text-[10px] leading-none">K</kbd>
      </div>
    </form>
  );
};

export default SearchBar;