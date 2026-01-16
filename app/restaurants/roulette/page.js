// app/restaurants/roulette/page.js
'use client';

import React from 'react';

import RestaurantRoulette from '@/components/ui/RestaurantRoulette';

export default function RoulettePage() {
  return (
    <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-8">
      <RestaurantRoulette />
    </div>
  );
}
