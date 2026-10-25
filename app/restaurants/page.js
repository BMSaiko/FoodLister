'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Navbar from '@/components/ui/navigation/Navbar';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { FiltersProvider } from '@/contexts';
import { usePaginatedRestaurants } from '@/hooks/restaurants/usePaginatedRestaurants';
import { useCuisineOptions } from '@/hooks/restaurants/useCuisineOptions';
import { useAuthUser } from '@/hooks/auth/useAuthUser';
import { useFiltersLogic } from '@/hooks/forms/useFiltersLogic';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePageTitle } from '@/hooks/usePageTitle';
import { trackEvent, Events } from '@/utils/analytics';

import HeroRestaurantCard from '@/components/ui/RestaurantList/HeroRestaurantCard';
import { RestaurantGrid } from '@/components/ui/RestaurantList/RestaurantGrid';
import RestaurantFilters from '@/components/ui/Filters/RestaurantFilters';
import NearbyBar from '@/components/ui/Nearby/NearbyBar';
import { useNearbyRestaurants } from '@/hooks/restaurants/useNearbyRestaurants';

import Skeleton from '@/components/ui/Skeleton';

function RestaurantsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get('search');
  usePageTitle('Explorar Restaurantes - FoodLister');

  // ponytail (T49): filter state lives in the URL for deep-link/share
  const initialFilters = (() => {
    const cuisines = searchParams.get('cuisines')?.split(',').filter(Boolean) || [];
    const priceMin = searchParams.get('price_min') ? Number(searchParams.get('price_min')) : null;
    const priceMax = searchParams.get('price_max') ? Number(searchParams.get('price_max')) : null;
    const ratingMin = searchParams.get('rating_min') ? Number(searchParams.get('rating_min')) : null;
    const location = searchParams.get('location') || '';
    return { cuisines, priceMin, priceMax, ratingMin, visitedOnly: false, location };
  })();

  // filtros aplicados no servidor (/api/restaurants); o estado espelha o URL
  const [filters, setFilters] = useState(initialFilters);
  const cuisineOptions = useCuisineOptions();

  const handleFiltersChange = (f) => {
    setFilters(f);
    const isCleared = !f.cuisines.length && f.priceMin == null && f.priceMax == null && f.ratingMin == null && !f.location;
    trackEvent(isCleared ? Events.FILTER_CLEARED : Events.FILTER_APPLIED, {
      cuisines: f.cuisines.length ? f.cuisines.join(',') : undefined,
      price_min: f.priceMin ?? undefined,
      price_max: f.priceMax ?? undefined,
      rating_min: f.ratingMin ?? undefined,
      location: f.location || undefined,
    });
    const params = new URLSearchParams();
    if (f.cuisines.length) params.set('cuisines', f.cuisines.join(','));
    if (f.priceMin != null) params.set('price_min', String(f.priceMin));
    if (f.priceMax != null) params.set('price_max', String(f.priceMax));
    if (f.ratingMin != null) params.set('rating_min', String(f.ratingMin));
    if (f.location) params.set('location', f.location);
    const qs = params.toString();
    router.replace(qs ? `/restaurants?${qs}` : '/restaurants', { scroll: false });
  };
  const { user } = useAuthUser();
  const [sort, setSort] = useState({ sortBy: "random", sortDirection: "asc" });
  const { restaurants, loading, error, hasNext, total, loadingMore, loadMore } = usePaginatedRestaurants({
    searchQuery,
    filters,
    sortBy: sort.sortBy,
    sortDirection: sort.sortDirection,
  });
  // Aleatório: fotos primeiro (partição estável, mantém a ordem aleatória dentro de cada grupo)
  const hasPhoto = (r) => (r.images || []).some((u) => typeof u === 'string' && u.trim().startsWith('http'));
  const displayRestaurants = sort.sortBy === 'random'
    ? [...restaurants.filter(hasPhoto), ...restaurants.filter((r) => !hasPhoto(r))]
    : restaurants;
  const [nearbyActive, setNearbyActive] = useState(false);
  const [nearbyRadius, setNearbyRadius] = useState(10);
  const nearby = useNearbyRestaurants();

  // ponytail: uma pesquisa nova repõe a vista «perto de mim»
  useEffect(() => {
    setNearbyActive(false);
  }, [searchQuery]);

  return (
    <main className="min-h-[100dvh] bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Hero Card */}
        {!loading && <HeroRestaurantCard />}

        {/* Filters */}
        <div className="mb-6 md:mb-8 space-y-3">
          <RestaurantFilters
            cuisineOptions={cuisineOptions.map((c) => c.name)}
            totalRestaurants={total}
            initialFilters={initialFilters}
            onFiltersChange={handleFiltersChange}
            onSortChange={(sortBy, sortDirection) => setSort({ sortBy, sortDirection })}
            rightSlot={
              <>
                <NearbyBar
                  active={nearbyActive}
                  onToggle={() => { if (!nearbyActive) nearby.requestLocation(); setNearbyActive(v => !v); }}
                  radius={nearbyRadius}
                  onRadius={(r) => { setNearbyRadius(r); nearby.searchNearby({ radius: r }); }}
                  loading={nearby.loading}
                  error={nearby.error}
                  locationError={nearby.locationError}
                />
                {nearbyActive && nearby.meta && (
                  <span className="text-xs text-white/40">{nearby.meta.count} restaurantes a {nearby.meta.radius_km} km</span>
                )}
              </>
            }
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} variant="restaurant-card" />
            ))}
          </div>
        ) : (nearbyActive && (nearby.restaurants?.length || nearby.error)) ? (
          <div className="space-y-6">
            {nearby.loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} variant="restaurant-card" />)}
              </div>
            ) : nearby.error ? (
              <div className="text-center py-12 text-white/40">{nearby.error}</div>
            ) : (
              <>
                <RestaurantGrid restaurants={nearby.restaurants} searchQuery={searchQuery} />
                <p className="text-center text-sm text-white/30 py-6">{nearby.restaurants.length} restaurantes</p>
              </>
            )}
          </div>
        ) : displayRestaurants.length > 0 ? (
          <>
            <RestaurantGrid
              restaurants={displayRestaurants}
              searchQuery={searchQuery}
              hasMore={hasNext}
              loadingMore={loadingMore}
              onLoadMore={loadMore}
            />
            <p className="text-center text-sm text-white/30 py-6">
              {total} restaurantes
            </p>
          </>
        ) : (
          <div className="text-center py-12 text-white/40">
            {error ? `Erro: ${error}` : 'Nenhum restaurante encontrado.'}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {user && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: 'spring', stiffness: 200 }}
          className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40"
        >
          <Link
            href="/restaurants/create"
            className="w-14 h-14 rounded-full bg-[var(--primary)] text-black flex items-center justify-center shadow-lg hover:bg-[var(--primary-hover)] transition-colors fab-pulse"
            title="Criar restaurante"
          >
            <Plus className="w-6 h-6" />
          </Link>
        </motion.div>
      )}
    </main>
  );
}

export default function RestaurantsPage() {
  return (
    <FiltersProvider>
      <Navbar />
      <Suspense fallback={<div className="min-h-[100dvh] bg-[var(--background)]" />}>
        <RestaurantsContent />
      </Suspense>
    </FiltersProvider>
  );
}
