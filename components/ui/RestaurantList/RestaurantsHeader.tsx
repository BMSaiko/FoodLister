'use client';

interface RestaurantsHeaderProps {
  searchQuery: string | null;
  showHeader: boolean;
}

export function RestaurantsHeader({ searchQuery, showHeader }: RestaurantsHeaderProps) {
  if (!showHeader) return null;

  if (searchQuery) {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Resultados para "{searchQuery}"
        </h1>
      </div>
    );
  }

  return null;
}
