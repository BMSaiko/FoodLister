'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChefHat, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const RouletteBanner = () => {
  const phrases = [
    "Não sabe onde comer hoje?",
    "Cansado das mesmas opções?",
    "Que tal uma surpresa deliciosa?",
    "Descubra novos sabores!",
    "Deixe o destino escolher!"
  ];

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
    }, 5000); // Muda a cada 5 segundos

    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 pt-6 sm:pt-8">
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-xl shadow-lg py-10 sm:py-12 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

        <div className="relative flex flex-col items-center justify-center text-center gap-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-full">
              <ChefHat className="h-6 w-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              Roleta de Restaurantes
            </h2>
            <Sparkles className="h-5 w-5 text-yellow-200" />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhraseIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.5,
                ease: "easeInOut"
              }}
              className="h-16 sm:h-20 flex items-center justify-center px-4 text-amber-100 text-lg sm:text-xl max-w-2xl text-center"
            >
              {phrases[currentPhraseIndex]} Gire a roleta e descubra novas experiências culinárias.
            </motion.div>
          </AnimatePresence>

          <div className="mt-2">
            <Link
              href="/restaurants/roulette"
              className="inline-flex items-center px-8 py-4 bg-white text-amber-600 font-semibold rounded-lg hover:bg-amber-50 active:bg-amber-100 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 text-lg"
            >
              <ChefHat className="h-5 w-5 mr-2" />
              Gire a Roleta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouletteBanner;
