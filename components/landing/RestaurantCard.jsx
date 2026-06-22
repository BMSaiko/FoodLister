'use client';
import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Star, MapPin } from 'lucide-react';

const RESTAURANTS = [
  { name: 'Tone das Francesinhas', rating: 4.8, location: 'Porto', price: '€15', reviews: 234 },
  { name: 'Gelataria Mona Lisa', rating: 4.9, location: 'Lisboa', price: '€8', reviews: 189 },
  { name: 'Hard Drivers Custom', rating: 4.7, location: 'Porto', price: '€25', reviews: 156 },
  { name: 'Café Parque', rating: 4.6, location: 'Braga', price: '€10', reviews: 312 },
];

export default function RestaurantCard() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-1.5, 1.5]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [1, 0.9, 0.9, 0.7]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) => {
      if (v < 0.25) setCurrentIndex(0);
      else if (v < 0.5) setCurrentIndex(1);
      else if (v < 0.75) setCurrentIndex(2);
      else setCurrentIndex(3);
    });
    return unsubscribe;
  }, [scrollYProgress]);

  const restaurant = RESTAURANTS[currentIndex];

  return (
    <motion.div
      style={{ y, rotate, opacity }}
      className="hidden lg:block sticky top-1/2 -translate-y-1/2 w-[340px] ml-auto"
    >
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-3xl overflow-hidden bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl"
        style={{ boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)' }}
      >
        {/* Image placeholder */}
        <div className="relative h-44 bg-gradient-to-br from-amber-500/15 to-orange-500/15 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center">
              <span className="text-3xl">🍽️</span>
            </div>
          </div>
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-white">
            {restaurant.price}
          </div>
          <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white/80">
            {restaurant.reviews} reviews
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">{restaurant.name}</h3>
          <div className="flex items-center gap-4 text-sm text-[var(--foreground-secondary)]">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-[var(--primary)] fill-[var(--primary)]" />
              {restaurant.rating}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {restaurant.location}
            </span>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pb-4">
          {RESTAURANTS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-6 bg-[var(--primary)]' : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
