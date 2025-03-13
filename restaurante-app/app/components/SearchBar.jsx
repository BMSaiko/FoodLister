"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?search=${query}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex">
      <input
        type="text"
        placeholder="Procurar..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="p-2 rounded-l border border-gray-300"
      />
      <button type="submit" className="p-2 bg-blue-500 text-white rounded-r">
        🔍
      </button>
    </form>
  );
};

export default SearchBar;
