// app/restaurants/roulette/page.js
'use client';

import React from 'react';
import Navbar from '@/components/layouts/Navbar';
import RestaurantRoulette from '@/components/ui/RestaurantRoulette';

export default function RoulettePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <RestaurantRoulette />
      </div>
    </main>
  );
}
