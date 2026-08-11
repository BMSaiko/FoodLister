'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Navbar from '@/components/ui/navigation/Navbar';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { FiltersProvider } from '@/contexts';
import { useAllRestaurants } from '@/hooks/data/useAllRestaurants';
import { useAuthUser } from '@/hooks/auth/useAuthUser';
import { useFiltersLogic } from '@/hooks/forms/useFiltersLogic';
import { useSearchParams } from 'next/navigation';

import HeroRestaurantCard from '@/components/ui/RestaurantList/HeroRestaurantCard';
import { RestaurantGrid } from '@/components/ui/RestaurantList/RestaurantGrid';
import RestaurantFilters from '@/components/ui/Filters/RestaurantFilters';
import NearbyBar from '@/components/ui/Nearby/NearbyBar';
import { useNearbyRestaurants } from '@/hooks/restaurants/useNearbyRestaurants';

import Skeleton from '@/components/ui/Skeleton';

function RestaurantsContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const { user } = useAuthUser();
  const { restaurants, loading, error } = useAllRestaurants({ searchQuery });
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurants);
  const [nearbyActive, setNearbyActive] = useState(false);
  const [nearbyRadius, setNearbyRadius] = useState(10);
  const nearby = useNearbyRestaurants();

  // Sync when new data loads (e.g. search query change, refetch)
  useEffect(() => {
    setFilteredRestaurants(restaurants);
    // ponytail: a search change resets nearby view
    setNearbyActive(false);
  }, [restaurants, searchQuery]);

  // Import useEffect



  return (
    <main className="min-h-[100dvh] bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Hero Card */}
        {!loading && <HeroRestaurantCard restaurants={restaurants} />}

        {/* Filters */}
        <div className="mb-6 md:mb-8 space-y-3">
          <RestaurantFilters
            restaurants={restaurants}
            onFiltered={(filtered) => setFilteredRestaurants(filtered)}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
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
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} variant="restaurant-card" />
            ))}
          </div>
        ) : (nearbyActive && (nearby.restaurants?.length || nearby.error)) ? (
          <div className="space-y-6">
            {nearby.loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} variant="restaurant-card" />)}
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
        ) : filteredRestaurants.length > 0 ? (
          <>
            <RestaurantGrid
              restaurants={filteredRestaurants}
              searchQuery={searchQuery}
            />
            <p className="text-center text-sm text-white/30 py-6">
              {filteredRestaurants.length} restaurantes
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
