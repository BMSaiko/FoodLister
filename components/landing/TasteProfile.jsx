'use client';
import { useState } from 'react';
import { motion } from 'motion/react';

const TASTES = [
  { id: 'savory', label: 'Salgado', emoji: '🧂' },
  { id: 'sweet', label: 'Doce', emoji: '🍯' },
  { id: 'spicy', label: 'Picante', emoji: '🌶️' },
  { id: 'fresh', label: 'Fresco', emoji: '🌿' },
  { id: 'umami', label: 'Umami', emoji: '🍄' },
  { id: 'smoky', label: 'Defumado', emoji: '🔥' },
];

export default function TasteProfile() {
  const [selected, setSelected] = useState([]);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  return (
    <div className="text-center">
      <span className="text-xs uppercase tracking-[0.2em] text-[var(--primary)] font-mono mb-4 block">
        Personaliza
      </span>
      <h2 className="text-3xl md:text-5xl font-bold text-[var(--foreground)] tracking-tighter mb-4">
        Qual é o teu <span className="text-[var(--primary)]">paladar</span>?
      </h2>
      <p className="text-[var(--foreground-secondary)] mb-8 max-w-md mx-auto">
        Seleciona os sabores que mais te identificamos. Vamos personalizar a tua experiência.
      </p>

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {TASTES.map((taste) => (
          <motion.button
            key={taste.id}
            onClick={() => toggle(taste.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative px-6 py-3 rounded-full font-medium transition-all duration-150 min-h-[48px] ${
              selected.includes(taste.id)
                ? 'bg-[var(--primary)] text-black'
                : 'bg-white/[0.03] border border-white/[0.08] text-[var(--foreground)] hover:bg-white/[0.06]'
            }`}
          >
            <span className="mr-2">{taste.emoji}</span>
            {taste.label}
            {selected.includes(taste.id) && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--success)] text-white text-xs rounded-full flex items-center justify-center font-bold"
              >
                ✓
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>

      {selected.length > 0 && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-[var(--foreground-muted)]"
        >
          {selected.length === 1 && 'Excelente escolha! Vamos mostrar-te os melhores.'}
          {selected.length === 2 && 'Combinação interessante! Temos sugestões para ti.'}
          {selected.length >= 3 && 'Paladar eclético! Vamos surpreender-te.'}
        </motion.p>
      )}
    </div>
  );
}
