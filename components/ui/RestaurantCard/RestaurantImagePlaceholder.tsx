'use client';

import React from 'react';

interface RestaurantImagePlaceholderProps {
  name?: string;
  className?: string;
  /** hero: Tovi grande e sem nome (o nome já está no título) */
  variant?: 'card' | 'hero';
}

// Fundos escuros e frios: o Tovi é âmbar (#f59e0b), em fundo âmbar desaparecia.
const GRADIENTS = [
  'from-sky-900/60 via-slate-900 to-[#0a0a0a]',
  'from-emerald-900/50 via-slate-900 to-[#0a0a0a]',
  'from-violet-900/50 via-slate-900 to-[#0a0a0a]',
  'from-rose-900/45 via-slate-900 to-[#0a0a0a]',
  'from-teal-900/55 via-slate-900 to-[#0a0a0a]',
  'from-indigo-900/55 via-slate-900 to-[#0a0a0a]',
];
const TOVIS = [
  'tovi-a-celebrar', 'tovi-a-dormir', 'tovi-a-pensar', 'tovi-a-piscar-o-olho', 'tovi-apaixonada',
  'tovi-feliz', 'tovi-fixe', 'tovi-surpreendida', 'tovi-triste', 'tovi-zangada',
];

const hash = (s: string) => Array.from(s).reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/** Restaurante sem imagem: gradiente escuro + Tovi aleatório (um dos 10), estável por nome (sem imagem externa). */
const RestaurantImagePlaceholder: React.FC<RestaurantImagePlaceholderProps> = ({
  name = 'Restaurante',
  className = '',
  variant = 'card',
}) => {
  const h = hash(name);
  const size = variant === 'hero' ? 160 : 72;
  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden bg-gradient-to-br ${GRADIENTS[(h >> 5) % GRADIENTS.length]} ${className}`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/mascot/${TOVIS[h % TOVIS.length]}.svg`}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="relative"
      />
      {variant === 'card' && (
        <p className="relative max-w-[160px] truncate text-xs font-medium text-white/60">{name}</p>
      )}
    </div>
  );
};

export default RestaurantImagePlaceholder;
