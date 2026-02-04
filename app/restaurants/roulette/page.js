// app/restaurants/roulette/page.js
'use client';

import React, { useState } from 'react';
import { ChefHat, Apple, MapPin, Coffee, Wine, Utensils } from 'lucide-react';
import Navbar from '@/components/layouts/Navbar';
import RestaurantRoulette from '@/components/ui/RestaurantList/RestaurantRoulette';


export default function RoulettePage() {
  const [isVisible, setIsVisible] = useState(false);

  // Iniciar animações quando o componente monta
  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Elementos decorativos de fundo - estilo landing page */}
      <div className="absolute inset-0 opacity-80 pointer-events-none">
        {/* Elementos principais - visíveis em todos os dispositivos */}
        <div className={`absolute top-10 left-5 w-20 h-20 sm:w-24 sm:h-24 bg-amber-600 rounded-full animate-float-visible transition-all duration-1000 shadow-lg ${isVisible ? 'translate-y-0' : 'translate-y-10'}`}></div>
        <ChefHat className={`absolute top-32 right-8 w-8 h-8 sm:w-10 sm:h-10 text-amber-900 animate-bounce-visible transition-all duration-1000 delay-700 drop-shadow-lg ${isVisible ? 'scale-100' : 'scale-0'}`} />
        <Apple className={`absolute bottom-24 right-6 w-6 h-6 sm:w-8 sm:h-8 text-orange-800 animate-bounce-visible transition-all duration-1000 delay-1500 drop-shadow-lg ${isVisible ? 'translate-x-0' : 'translate-x-5'}`} />
        
        {/* Elementos secundários - ocultos em mobile para melhor performance */}
        <div className={`absolute top-40 right-16 w-16 h-16 sm:w-20 sm:h-20 bg-orange-600 rounded-full animate-float-delayed-visible transition-all duration-1000 delay-300 shadow-xl hidden sm:block ${isVisible ? 'translate-y-0' : 'translate-y-10'}`}></div>
        <div className={`absolute bottom-32 left-16 w-12 h-12 sm:w-16 sm:h-16 bg-yellow-600 rounded-full animate-pulse-visible transition-all duration-1000 delay-500 shadow-xl hidden sm:block ${isVisible ? 'translate-y-0' : 'translate-y-10'}`}></div>
        
        {/* Elementos adicionais - ocultos em mobile */}
        <div className={`absolute top-24 left-1/3 w-8 h-8 sm:w-10 sm:h-10 bg-amber-700 rounded-full animate-ping transition-all duration-1000 delay-900 hidden sm:block ${isVisible ? 'scale-100' : 'scale-0'}`}></div>
        <div className={`absolute bottom-24 right-1/3 w-6 h-6 sm:w-8 sm:h-8 bg-orange-700 rounded-full animate-pulse transition-all duration-1000 delay-1100 hidden sm:block ${isVisible ? 'scale-100' : 'scale-0'}`}></div>
        <MapPin className={`absolute top-1/2 left-6 w-6 h-6 sm:w-8 sm:h-8 text-amber-900 animate-float-slow transition-all duration-1000 delay-1300 drop-shadow-lg hidden sm:block ${isVisible ? 'translate-x-0' : '-translate-x-5'}`} />
        
        {/* Novos elementos inspirados na landing page */}
        <div className={`absolute top-1/4 left-1/4 w-16 h-16 sm:w-20 sm:h-20 bg-yellow-600/100 rounded-full blur-xl animate-float transition-all duration-1000 shadow-2xl hidden sm:block ${isVisible ? 'opacity-80' : 'opacity-0'}`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-14 h-14 sm:w-18 sm:h-18 bg-orange-600/100 rounded-full blur-lg animate-float-delayed transition-all duration-1000 delay-300 shadow-xl hidden sm:block ${isVisible ? 'opacity-80' : 'opacity-0'}`}></div>
        <div className={`absolute top-1/2 right-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-amber-600/100 rounded-full blur-md animate-pulse transition-all duration-1000 delay-500 hidden sm:block ${isVisible ? 'opacity-80' : 'opacity-0'}`}></div>
        <div className={`absolute bottom-1/2 left-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-red-600/100 rounded-full blur-lg animate-bounce transition-all duration-1000 delay-700 hidden sm:block ${isVisible ? 'opacity-80' : 'opacity-0'}`}></div>
        
        {/* Ícones adicionais inspirados na landing page */}
        <Coffee className={`absolute top-1/3 left-1/4 w-5 h-5 sm:w-6 sm:h-6 text-yellow-700 animate-bounce drop-shadow-xl hidden sm:block ${isVisible ? 'opacity-80 translate-y-0' : 'opacity-0 translate-y-5'}`} />
        <Wine className={`absolute bottom-1/4 right-1/4 w-4 h-4 sm:w-5 sm:h-5 text-orange-700 animate-bounce drop-shadow-xl hidden sm:block ${isVisible ? 'opacity-80 translate-x-0' : 'opacity-0 translate-x-5'}`} />
        <Utensils className={`absolute top-2/3 left-1/3 w-4 h-4 sm:w-5 sm:h-5 text-amber-800 animate-spin drop-shadow-xl hidden sm:block ${isVisible ? 'opacity-80 scale-100' : 'opacity-0 scale-0'}`} />
        
        {/* Partículas menores para mais dinamismo */}
        <div className={`absolute top-16 right-12 w-3 h-3 sm:w-4 sm:h-4 bg-amber-800 rounded-full animate-ping transition-all duration-1000 delay-200 shadow-2xl ${isVisible ? 'opacity-80' : 'opacity-0'}`}></div>
        <div className={`absolute bottom-16 left-12 w-3 h-3 sm:w-4 sm:h-4 bg-orange-800 rounded-full animate-pulse transition-all duration-1000 delay-400 shadow-2xl ${isVisible ? 'opacity-80' : 'opacity-0'}`}></div>
        <div className={`absolute top-3/4 right-1/3 w-2 h-2 sm:w-3 sm:h-3 bg-yellow-800 rounded-full animate-bounce transition-all duration-1000 delay-600 shadow-2xl hidden sm:block ${isVisible ? 'opacity-80' : 'opacity-0'}`}></div>
        <div className={`absolute bottom-1/4 left-1/3 w-2 h-2 sm:w-3 sm:h-3 bg-red-800 rounded-full animate-float-very-slow transition-all duration-1000 delay-800 shadow-2xl hidden sm:block ${isVisible ? 'opacity-80' : 'opacity-0'}`}></div>
        
        {/* Elementos adicionais para preencher o espaço */}
        <div className={`absolute top-20 right-1/4 w-4 h-4 sm:w-6 sm:h-6 bg-amber-800 rounded-full animate-float-slow transition-all duration-1000 delay-1000 hidden sm:block ${isVisible ? 'opacity-80' : 'opacity-0'}`}></div>
        <div className={`absolute bottom-20 left-1/4 w-4 h-4 sm:w-6 sm:h-6 bg-orange-800 rounded-full animate-float-very-slow transition-all duration-1000 delay-1200 hidden sm:block ${isVisible ? 'opacity-80' : 'opacity-0'}`}></div>
        <ChefHat className={`absolute top-3/4 right-1/3 w-4 h-4 sm:w-5 sm:h-5 text-orange-900 animate-float-delayed drop-shadow-2xl hidden sm:block ${isVisible ? 'opacity-80 translate-y-0' : 'opacity-0 translate-y-5'}`} />
        <Apple className={`absolute bottom-1/3 left-1/3 w-3 h-3 sm:w-4 sm:h-4 text-red-900 animate-pulse drop-shadow-2xl hidden sm:block ${isVisible ? 'opacity-80 translate-x-0' : 'opacity-0 translate-x-3'}`} />
      </div>

      <Navbar />
      
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-8 relative z-10">
        <RestaurantRoulette />
      </div>
    </main>
  );
}
