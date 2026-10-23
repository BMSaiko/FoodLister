'use client';
import { useState } from 'react';

const TASTES = [
  { id: 'savory', label: 'Salgado' },
  { id: 'sweet', label: 'Doce' },
  { id: 'spicy', label: 'Picante' },
  { id: 'fresh', label: 'Fresco' },
  { id: 'umami', label: 'Umami' },
  { id: 'smoky', label: 'Defumado' },
];

function message(n) {
  if (n === 0) return 'Escolhe pelo menos um sabor.';
  if (n === 1) return 'Excelente escolha! Vamos mostrar-te os melhores.';
  if (n === 2) return 'Combinação interessante! Temos sugestões para ti.';
  return 'Paladar eclético! Vamos surpreender-te.';
}

export default function TasteProfile() {
  const [selected, setSelected] = useState([]);
  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));

  return (
    <div className="max-w-2xl">
      <h2 id="taste-h" className="text-3xl md:text-5xl font-semibold text-[var(--foreground)] tracking-tighter">
        Qual é o teu <span className="text-[var(--primary)]">paladar</span>?
      </h2>
      <p className="text-[var(--foreground-secondary)] mt-4 mb-6">
        Escolhe os sabores que te definem. Usamos isto para afinar as sugestões.
      </p>
      <div className="flex flex-wrap gap-3" role="group" aria-label="Sabores">
        {TASTES.map((t) => {
          const on = selected.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(t.id)}
              className={`px-5 rounded-full min-h-[44px] border transition-colors duration-150 ${
                on
                  ? 'bg-amber-500/15 border-[var(--primary)] text-[var(--primary-hover)]'
                  : 'border-white/[0.08] text-[var(--foreground)] hover:border-amber-500/40'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <p className="mt-4 min-h-6 text-[var(--foreground-secondary)]" aria-live="polite">
        {message(selected.length)}
      </p>
    </div>
  );
}
