import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ searchType }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log(`Pesquisando por ${query} na seção ${searchType}`);
    // Implementar lógica de pesquisa
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <input
        type="text"
        placeholder={`Procurar ${searchType === 'restaurants' ? 'restaurantes' : 'listas'}...`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-gray-100 pl-10 pr-4 py-2 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
    </form>
  );
};

export default SearchBar;