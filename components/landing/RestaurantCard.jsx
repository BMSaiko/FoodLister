'use client';
import { useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Star, MapPin } from 'lucide-react';
import { extractPlaceParts } from '@/utils/googleMapsExtractor';
import { pickSeeded } from '@/utils/random';
import { useAuthUser } from '@/hooks/auth/useAuthUser';

// ponytail: top-rated list from /api/home/stats, seeded pick (user + day, T76)
export default function RestaurantCard({ restaurants = [] }) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-1.5, 1.5]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [1, 0.9, 0.9, 0.7]);

  const { user } = useAuthUser();
  // ponytail: seeded by user + day (T76) — deterministic, no flicker, differs per user/day
  const r = pickSeeded(restaurants, user?.id);
  if (!r) return null;

  const mainImage =
    r.images && r.images[r.display_image_index]
      ? r.images[r.display_image_index]
      : r.images && r.images[0]
      ? r.images[0]
      : null;

  return (
    <motion.div
      style={{ y, rotate, opacity }}
      className="hidden lg:block sticky top-1/2 -translate-y-1/2 w-[340px] ml-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-3xl overflow-hidden bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl"
        style={{ boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)' }}
      >
        {/* Image */}
        <div className="relative h-44 bg-gradient-to-br from-amber-500/15 to-orange-500/15 overflow-hidden">
          {mainImage ? (
            <img src={mainImage} alt={r.name} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-3xl">🍽️</span>
              </div>
            </div>
          )}
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-white">
            {r.price_per_person ? `€${r.price_per_person}` : '—'}
          </div>
          <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white/80">
            {r.review_count} reviews
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">{r.name}</h3>
          <div className="flex items-center gap-4 text-sm text-[var(--foreground-secondary)]">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-[var(--primary)] fill-[var(--primary)]" />
              {r.rating}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {(function () {
                const { city, district, country } = extractPlaceParts(r.location);
                return [city, district, country].filter(Boolean).join(', ') || '—';
              })()}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
