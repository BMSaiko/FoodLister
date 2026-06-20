// app/restaurants/page.js
'use client';

import Navbar from '@/components/ui/navigation/Navbar';
import RestaurantsList from '@/components/RestaurantsList';
import RouletteBanner from '@/components/ui/RestaurantList/RouletteBanner';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

export default function RestaurantsPage() {
  return (
    <ErrorBoundary pageName="Restaurants">
      <main className="min-h-screen bg-background-secondary">
        <Navbar />

        <RouletteBanner />

        <RestaurantsList showHeader={true} />
      </main>
    </ErrorBoundary>
  );
}
