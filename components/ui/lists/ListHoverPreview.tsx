'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import Link from 'next/link';
import { Star, MapPin } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  rating?: number;
  location?: string;
  image_url?: string;
}

interface ListHoverPreviewProps {
  restaurants: Restaurant[];
  children: React.ReactNode;
}

export default function ListHoverPreview({ restaurants, children }: ListHoverPreviewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const previewRestaurants = restaurants.slice(0, 3);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}

      <AnimatePresence>
        {isHovered && previewRestaurants.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 -bottom-2 translate-y-full"
          >
            <div className="rounded-xl bg-[var(--card-bg)] border border-white/[0.08] shadow-xl p-3 space-y-2">
              <p className="text-xs font-medium text-[var(--foreground-muted)] mb-2">
                Restaurantes nesta lista
              </p>
              {previewRestaurants.map((r) => (
                <Link
                  key={r.id}
                  href={`/restaurants/${r.id}`}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[0.03] transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs">🍽️</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--foreground)] truncate">{r.name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-[var(--foreground-muted)]">
                      {r.rating != null && <span>⭐ {r.rating.toFixed(1)}</span>}
                      {r.location && <span>📍 {r.location}</span>}
                    </div>
                  </div>
                </Link>
              ))}
              {restaurants.length > 3 && (
                <p className="text-[10px] text-[var(--foreground-muted)] text-center pt-1">
                  +{restaurants.length - 3} mais
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
