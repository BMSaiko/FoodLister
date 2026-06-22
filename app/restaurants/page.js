'use client';

import React, { Suspense, useState } from 'react';
import Navbar from '@/components/ui/navigation/Navbar';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { FiltersProvider } from '@/contexts/index';
import { useRestaurants } from '@/hooks/data/useRestaurants';
import { useVisitsData } from '@/hooks/data/useVisitsData';
import { useAuth } from '@/contexts';
import { useFiltersLogic } from '@/hooks/forms/useFiltersLogic';
import { useSearchParams } from 'next/navigation';

import HeroRestaurantCard from '@/components/ui/RestaurantList/HeroRestaurantCard';
import { RestaurantGrid } from '@/components/ui/RestaurantList/RestaurantGrid';
import RestaurantFilters from '@/components/ui/Filters/RestaurantFilters';

import Skeleton from '@/components/ui/Skeleton';

function RestaurantsContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const { user } = useAuth();
  const { restaurants, loading } = useRestaurants({ searchQuery });
  const { visitsData, loadingVisits, handleVisitsDataUpdate } = useVisitsData(restaurants, user);
  const { filters, setFilters, filteredRestaurants: _, activeFilters, clearFilters } = useFiltersLogic(restaurants, visitsData, user);
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurants);

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Hero Card */}
        {!loading && <HeroRestaurantCard restaurants={restaurants} />}

        {/* Filters */}
        <div className="mb-6 md:mb-8">
          <RestaurantFilters
            restaurants={restaurants}
            onFiltered={(filtered) => setFilteredRestaurants(filtered)}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="restaurant-card" />
            ))}
          </div>
        ) : (
          <RestaurantGrid
            restaurants={filteredRestaurants}
            visitsData={visitsData}
            loadingVisits={loadingVisits}
            onVisitsDataUpdate={handleVisitsDataUpdate}
            searchQuery={searchQuery}
          />
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
      <Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
        <RestaurantsContent />
      </Suspense>
    </FiltersProvider>
  );
}
