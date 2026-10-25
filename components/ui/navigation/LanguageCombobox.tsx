'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Ico from '@/components/ui/icons/Ico';
import { LANGUAGES } from '@/libs/languages';

// ponytail: minimal language dropdown. Real combobox-with-search overkill for 2 items.
export default function LanguageCombobox() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Language"
        aria-expanded={open}
        className="min-h-[44px] px-3 gap-1.5 rounded-[10px] text-sm text-white/55 hover:text-[var(--foreground)] hover:bg-white/5 transition-colors flex items-center justify-center"
      >
        <Ico name="globe" />
        <span className="hidden md:inline">{current.code.toUpperCase()}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-36 rounded-xl bg-[var(--card-bg)] border border-white/[0.08] shadow-xl overflow-hidden z-50 py-1">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-white/[0.03] ${l.code === lang ? 'text-[var(--foreground)]' : 'text-[var(--foreground-secondary)]'}`}
            >
              <span>{l.flag}</span> {l.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
