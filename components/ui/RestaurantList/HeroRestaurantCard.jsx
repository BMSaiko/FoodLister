'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import { Star, MapPin, ChevronRight } from 'lucide-react';

const getRandomRestaurant = (restaurants) => {
  if (!restaurants || restaurants.length === 0) return null;
  return restaurants[Math.floor(Math.random() * restaurants.length)];
};

export default function HeroRestaurantCard({ restaurants }) {
  const [hero, setHero] = useState(null);
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 300], [0, -50]);
  const overlayOpacity = useTransform(scrollY, [0, 300], [0.4, 0.7]);

  useEffect(() => {
    setHero(getRandomRestaurant(restaurants));
  }, [restaurants]);

  if (!hero) return null;

  const imageUrl = hero.images?.[0] || hero.image_url || '';
  const hasImage = imageUrl && !imageUrl.includes('placeholder');

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-3xl overflow-hidden mb-8 md:mb-12"
    >
      {/* Parallax Image */}
      <motion.div style={{ y: imageY }} className="absolute inset-0">
        {hasImage ? (
          <img
            src={imageUrl}
            alt={hero.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <span className="text-8xl">🍽️</span>
          </div>
        )}
      </motion.div>

      {/* Gradient Overlay */}
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"
      />

      {/* Content */}
      <div className="relative z-10 p-8 md:p-12 min-h-[300px] md:min-h-[380px] flex flex-col justify-end max-w-[70%]">
        {/* Cuisine tags */}
        <div className="flex items-center gap-2 mb-3">
          {hero.cuisine_types?.slice(0, 2)?.map((cuisine) => (
            <span key={cuisine.id} className="text-xs px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/80">
              {cuisine.name}
            </span>
          ))}
        </div>

        <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tighter mb-2">
          {hero.name}
        </h2>

        <div className="flex items-center gap-4 text-white/70 text-sm mb-3">
          {hero.rating != null && (
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              {hero.rating.toFixed(1)}
            </span>
          )}
          {hero.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {hero.location}
            </span>
          )}
          {hero.price_per_person != null && (
            <span className="text-amber-400 font-semibold">€{hero.price_per_person}</span>
          )}
        </div>

        {hero.description && (
          <p className="text-white/60 text-sm max-w-lg mb-5 line-clamp-2">
            {hero.description}
          </p>
        )}

        <Link
          href={`/restaurants/${hero.id}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-black font-semibold rounded-full hover:bg-[var(--primary-hover)] transition-colors w-fit"
        >
          Ver Restaurante
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
