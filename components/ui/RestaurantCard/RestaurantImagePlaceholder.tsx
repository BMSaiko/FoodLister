'use client';

import React from 'react';

interface RestaurantImagePlaceholderProps {
  name?: string;
  className?: string;
}

/** Cartão sem imagem: Tovi sobre fundo de token (sem imagem externa). */
const RestaurantImagePlaceholder: React.FC<RestaurantImagePlaceholderProps> = ({
  name = 'Restaurante',
  className = '',
}) => (
  <div
    className={`absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--card-bg)] ${className}`}
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/mascot/tovi-a-pensar.svg" alt="" aria-hidden="true" width={72} height={72} className="h-[72px] w-[72px]" />
    <p className="max-w-[160px] truncate text-xs font-medium text-[var(--gray-500)]">{name}</p>
  </div>
);

export default RestaurantImagePlaceholder;
