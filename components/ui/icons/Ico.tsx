import React from 'react';

// ícones do design da home (docs/mockups/home), mesmo traço 1.6 em 24x24
const P: Record<string, { w?: number; d: React.ReactNode }> = {
  pin: { d: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.4" /></> },
  list: { d: <><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="1" fill="currentColor" /><circle cx="4.5" cy="12" r="1" fill="currentColor" /><circle cx="4.5" cy="18" r="1" fill="currentColor" /></> },
  star: { d: <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8Z" /> },
  dice: { d: <><rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="9" cy="9" r="1.1" fill="currentColor" /><circle cx="15" cy="15" r="1.1" fill="currentColor" /><circle cx="15" cy="9" r="1.1" fill="currentColor" /><circle cx="9" cy="15" r="1.1" fill="currentColor" /></> },
  plus: { w: 1.8, d: <path d="M12 5v14M5 12h14" /> },
  arrow: { w: 1.8, d: <path d="M5 12h14M13 6l6 6-6 6" /> },
  search: { d: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></> },
  globe: { d: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c3 3.5 3 13.5 0 17M12 3.5c-3 3.5-3 13.5 0 17" /></> },
  bell: { d: <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15ZM10 20h4" /> },
  user: { d: <><circle cx="12" cy="8.5" r="3.6" /><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" /></> },
  home: { d: <path d="M4 11 12 4l8 7v8.5H4Z" /> },
  fork: { d: <path d="M7 3v8a2 2 0 0 0 2 2v8M11 3v8a2 2 0 0 1-2 2M17 21V3c-2.5 1.5-3 5-3 8h3" /> },
  x: { d: <path d="M6 6l12 12M18 6 6 18" /> },
  locate: { d: <><circle cx="12" cy="12" r="6.5" /><circle cx="12" cy="12" r="1.6" fill="currentColor" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" /></> },
  chevron: { d: <path d="m6 15 6-6 6 6" /> },
};

export type IcoName = keyof typeof P;

export default function Ico({ name, className = 'w-5 h-5' }: { name: IcoName; className?: string }) {
  const { w = 1.6, d } = P[name];
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {d}
    </svg>
  );
}
