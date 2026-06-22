'use client';

import React from 'react';

interface ListCardCoverProps {
  name: string;
  className?: string;
}

const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};

const getGradient = (hash: number) => {
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 60) % 360;
  const hue3 = (hue1 + 120) % 360;
  return {
    from: `hsl(${hue1}, 70%, 15%)`,
    via: `hsl(${hue2}, 60%, 12%)`,
    to: `hsl(${hue3}, 50%, 10%)`,
    accent: `hsl(${hue1}, 80%, 65%)`,
  };
};

const PATTERNS = [
  (accent: string) => `<circle cx="80%" cy="20%" r="40" fill="${accent}" opacity="0.15"/><circle cx="20%" cy="80%" r="30" fill="${accent}" opacity="0.1"/>`,
  (accent: string) => `<line x1="0" y1="100%" x2="100%" y2="0" stroke="${accent}" stroke-width="20" opacity="0.08"/><line x1="0" y1="50%" x2="50%" y2="0" stroke="${accent}" stroke-width="15" opacity="0.06"/>`,
  (accent: string) => `<circle cx="25%" cy="25%" r="4" fill="${accent}" opacity="0.2"/><circle cx="75%" cy="75%" r="3" fill="${accent}" opacity="0.15"/><circle cx="50%" cy="10%" r="2" fill="${accent}" opacity="0.1"/><circle cx="10%" cy="60%" r="3" fill="${accent}" opacity="0.12"/>`,
  (accent: string) => `<path d="M0,50 Q50,0 100,50 T200,50" stroke="${accent}" stroke-width="8" fill="none" opacity="0.1"/>`,
];

export default function ListCardCover({ name, className = '' }: ListCardCoverProps) {
  const colors = getGradient(hashCode(name));
  const patternIndex = Math.abs(hashCode(name + 'pattern')) % PATTERNS.length;
  const pattern = PATTERNS[patternIndex](colors.accent);
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.via} 50%, ${colors.to} 100%)` }}
      />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
        <g dangerouslySetInnerHTML={{ __html: pattern }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl font-bold opacity-20" style={{ color: colors.accent }}>
          {initial}
        </span>
      </div>
    </div>
  );
}
