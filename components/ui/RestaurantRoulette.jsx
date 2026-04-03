"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Shuffle, X, ExternalLink, MapPin, Star, EuroSign } from 'lucide-react';
import Link from 'next/link';

export default function RestaurantRoulette({ restaurants, onClose }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [spinCount, setSpinCount] = useState(0);

  const spin = useCallback(() => {
    if (isSpinning || restaurants.length === 0) return;

    setIsSpinning(true);
    setShowResult(false);
    setSelectedRestaurant(null);
    setSpinCount(prev => prev + 1);

    // Animation: cycle through restaurants quickly, then slow down
    let currentIdx = 0;
    let speed = 50; // Start fast
    let totalSpins = 20 + Math.floor(Math.random() * 15); // Random number of spins
    let spinsCompleted = 0;

    const animate = () => {
      currentIdx = (currentIdx + 1) % restaurants.length;
      setCurrentIndex(currentIdx);
      spinsCompleted++;

      if (spinsCompleted < totalSpins) {
        // Slow down as we approach the end
        if (spinsCompleted > totalSpins * 0.7) {
          speed += 30;
        } else if (spinsCompleted > totalSpins * 0.5) {
          speed += 15;
        }
        setTimeout(animate, speed);
      } else {
        // Final selection
        setIsSpinning(false);
        setSelectedRestaurant(restaurants[currentIdx]);
        setShowResult(true);
      }
    };

    animate();
  }, [isSpinning, restaurants]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSpinning) {
        onClose();
      }
      if (e.key === ' ' && !isSpinning) {
        e.preventDefault();
        spin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, spin, onClose]);

  if (restaurants.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Roleta de Restaurantes</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-gray-500 text-center py-8">
            Não há restaurantes nesta lista para girar a roleta.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={isSpinning}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            🎰 Roleta de Restaurantes
          </h3>
          <p className="text-gray-500 text-sm">
            Não consegue decidir? Deixe a roleta escolher por si!
          </p>
        </div>

        {/* Roulette Display */}
        <div className="relative mb-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
            {/* Pointer */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-amber-500"></div>
            </div>

            {/* Current Restaurant */}
            <div className={`transition-all duration-200 ${isSpinning ? 'scale-95 opacity-70' : 'scale-100 opacity-100'}`}>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden">
                  {restaurants[currentIndex]?.image_url ? (
                    <img
                      src={restaurants[currentIndex].image_url}
                      alt={restaurants[currentIndex].name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">🍽️</span>
                  )}
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-1">
                  {restaurants[currentIndex]?.name}
                </h4>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                  {restaurants[currentIndex]?.rating && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500" />
                      {restaurants[currentIndex].rating.toFixed(1)}
                    </span>
                  )}
                  {restaurants[currentIndex]?.price_per_person && (
                    <span className="flex items-center gap-1">
                      €{restaurants[currentIndex].price_per_person.toFixed(2)}
                    </span>
                  )}
                </div>
                {restaurants[currentIndex]?.location && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {restaurants[currentIndex].location}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Spin Button */}
        <button
          onClick={spin}
          disabled={isSpinning}
          className={`w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all ${
            isSpinning
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg'
          }`}
        >
          <Shuffle className={`h-5 w-5 ${isSpinning ? 'animate-spin' : ''}`} />
          {isSpinning ? 'A girar...' : spinCount > 0 ? 'Girar Novamente' : 'Girar Roleta'}
        </button>

        {/* Result */}
        {showResult && selectedRestaurant && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 animate-fade-in">
            <p className="text-green-800 font-medium text-center mb-2">
              🎉 Restaurante Selecionado!
            </p>
            <h4 className="text-lg font-bold text-green-900 text-center mb-3">
              {selectedRestaurant.name}
            </h4>
            <div className="flex gap-2">
              <Link
                href={`/restaurants/${selectedRestaurant.id}`}
                className="flex-1 py-2 px-3 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                Ver Detalhes
              </Link>
              <button
                onClick={spin}
                className="py-2 px-3 bg-white text-green-600 text-sm rounded-md border border-green-300 hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
              >
                <Shuffle className="h-4 w-4" />
                Girar Novamente
              </button>
            </div>
          </div>
        )}

        {/* Restaurant Count */}
        <p className="text-center text-xs text-gray-400 mt-4">
          {restaurants.length} restaurante{restaurants.length !== 1 ? "s" : ""} na lista
        </p>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}