'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Star, MapPin, ChevronRight } from 'lucide-react';
import { extractPlaceParts } from '@/utils/googleMapsExtractor';
import { CreatorLink } from '@/components/ui/common/CreatorLink';

const getRandomRestaurant = (restaurants) => {
  if (!restaurants || restaurants.length === 0) return null;
  return restaurants[Math.floor(Math.random() * restaurants.length)];
};

export default function HeroRestaurantCard({ restaurants }) {
  const [hero, setHero] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 300], [0, -50]);
  const overlayOpacity = useTransform(scrollY, [0, 300], [0.4, 0.7]);

  useEffect(() => {
    setHero(getRandomRestaurant(restaurants));
    setImgIdx(0);
  }, [restaurants]);

  // ponytail: crossfade through the restaurant's own photos (carousel feel)
  const imgCount = (hero?.images || []).filter((u) => u && !u.includes('placeholder')).length;
  useEffect(() => {
    if (imgCount <= 1) return;
    const id = setInterval(() => setImgIdx((i) => (i + 1) % imgCount), 4000);
    return () => clearInterval(id);
  }, [imgCount]);

  if (!hero) return null;

  const imgs = (hero.images || []).filter((u) => u && !u.includes('placeholder'));
  const imageUrl = (imgs[imgIdx] || imgs[0] || hero.image_url || '');
  const hasImage = imageUrl && !imageUrl.includes('placeholder');
  // ponytail: reuse the card's location parser instead of the full Google address
  const { city, district } = extractPlaceParts(hero.location);
  const place = [city, district].filter(Boolean).join(' · ') || hero.location || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-3xl overflow-hidden mb-8 md:mb-12"
    >
      {/* Crossfade through the restaurant's photos — no parallax on the img (jitter) */}
      <motion.div className="absolute inset-0">
        {hasImage ? (
          <AnimatePresence mode="popLayout">
            <motion.img
              key={imageUrl}
              src={imageUrl}
              alt={hero.name}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <span className="text-8xl">🍽️</span>
          </div>
        )}
        {imgs.length > 1 && (
          <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5">
            {imgs.map((u, i) => (
              <span key={u} className={`h-1.5 rounded-full transition-all duration-300 ${i === imgIdx ? 'w-6 bg-white/90' : 'w-1.5 bg-white/40'}`} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Gradient Overlay */}
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"
      />

      {/* Content */}
      <div className="relative z-10 p-8 md:p-12 min-h-[360px] md:min-h-[460px] flex flex-col justify-end max-w-[70%]">
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

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mb-3">
          {hero.rating != null && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-2.5 py-1 text-white/90">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              {hero.rating.toFixed(1)}
              {hero.review_count != null && hero.review_count > 0 && (
                <span className="text-white/50">({hero.review_count})</span>
              )}
            </span>
          )}
          {hero.price_per_person != null && (
            <span className="inline-flex items-center rounded-full bg-amber-500/15 text-amber-300 font-semibold px-2.5 py-1">
              €{hero.price_per_person}
            </span>
          )}
          {place && (
            <span className="inline-flex items-center gap-1 text-white/60">
              <MapPin className="w-4 h-4" />
              {place}
            </span>
          )}
          {(hero.creator_display_name || hero.creator_name) && (
            <span className="inline-flex items-center gap-1 text-white/50">
              Criado por{' '}
              <CreatorLink creatorId={hero.creator_user_code || hero.creator_id} name={(hero.creator_display_name || hero.creator_name) || ''} />
            </span>
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
