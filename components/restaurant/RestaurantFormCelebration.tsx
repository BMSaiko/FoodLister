'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface RestaurantFormCelebrationProps {
  show: boolean;
  restaurantId: string;
  restaurantName: string;
  onClose: () => void;
}

export default function RestaurantFormCelebration({ show, restaurantId, restaurantName, onClose }: RestaurantFormCelebrationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; size: number }>>([]);

  useEffect(() => {
    if (show) {
      const colors = ['#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#ec4899'];
      const newParticles = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
      }));
      setParticles(newParticles);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: '50vw', y: '50vh', scale: 0, opacity: 1 }}
              animate={{
                x: p.x + 'vw',
                y: p.y + 'vh',
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 1.5, delay: p.id * 0.02, ease: 'easeOut' }}
              className="absolute rounded-full"
              style={{
                background: p.color,
                width: p.size,
                height: p.size,
              }}
            />
          ))}

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="relative z-10 text-center p-8 rounded-3xl bg-[var(--card-bg)] border border-white/[0.08] shadow-2xl max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
              className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-10 h-10 text-emerald-400" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-2xl font-bold text-[var(--foreground)] mb-2"
            >
              Restaurante Criado!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-[var(--foreground-secondary)] mb-6"
            >
              &ldquo;{restaurantName}&rdquo; foi adicionado com sucesso.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex gap-3"
            >
              <Link
                href={'/restaurants/' + restaurantId}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[var(--primary)] text-black font-semibold rounded-full hover:bg-[var(--primary-hover)] transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Ver Restaurante
              </Link>
              <Link
                href="/restaurants"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-white/[0.03] border border-white/[0.08] text-[var(--foreground)] font-medium rounded-full hover:bg-white/[0.06] transition-colors"
              >
                Explorar
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
