'use client';

import React from 'react';

interface ListCardCoverProps {
  name: string;
  photos?: Array<{ name: string; image: string | null }>;
  total?: number;
  className?: string;
}

const TOVIS = ['a-celebrar', 'a-dormir', 'a-pensar', 'a-piscar-o-olho', 'apaixonada', 'feliz', 'fixe', 'surpreendida', 'triste', 'zangada'];

const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

// Capa 16/10: 1-4 fotos dos restaurantes (+N) ou, sem fotos, um Tovi sobre gradiente frio.
// ponytail: «random» estável por nome (Math.random quebraria a hidratação SSR).
export default function ListCardCover({ name, photos = [], total = 0, className = '' }: ListCardCoverProps) {
  const withImage = photos.filter((p) => p.image).slice(0, 4);
  const extra = total - withImage.length;

  if (withImage.length === 0) {
    const h = hashCode(name);
    const hue = 150 + (h % 150);
    return (
      <div
        className={`relative overflow-hidden aspect-[16/10] rounded-2xl ${className}`}
        style={{ background: `linear-gradient(135deg, hsl(${hue} 65% 24%), hsl(${(hue + 70) % 360} 60% 13%))` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/mascot/tovi-${TOVIS[h % TOVIS.length]}.svg`}
          alt=""
          className="absolute inset-0 m-auto w-[45%] max-w-[140px] aspect-square object-contain"
        />
      </div>
    );
  }

  const cols = withImage.length === 1 ? 'grid-cols-1' : 'grid-cols-2';
  return (
    <div className={`relative overflow-hidden aspect-[16/10] rounded-2xl bg-white/[0.04] grid ${cols} gap-0.5 ${className}`}>
      {withImage.map((p, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={p.image as string}
          alt=""
          loading="lazy"
          className={`w-full h-full object-cover ${withImage.length === 3 && i === 0 ? 'row-span-2' : ''}`}
        />
      ))}
      {extra > 0 && (
        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-xs font-semibold">
          +{extra}
        </span>
      )}
    </div>
  );
}
