'use client';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Ico from '@/components/ui/icons/Ico';
import './RoletaDeck.css';

const TOVIS = ['a-pensar', 'feliz', 'apaixonada', 'a-celebrar'];
const DECK = 5;
const sleep = (t) => new Promise((r) => setTimeout(r, t));

function photo(r) {
  const imgs = r?.images || [];
  return imgs[r?.display_image_index] || imgs[0] || null;
}

function sample(list, n, avoid) {
  const pool = [...list];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const out = pool.slice(0, n);
  // a carta do meio (índice 2) é a escolhida: evitar repetir a anterior
  if (avoid != null && out.length > 2 && out[2].id === avoid && pool.length > n) {
    out[2] = pool[n];
  }
  return out;
}

/**
 * Roleta da home: baralho de 5 cartas sorteadas dos restaurantes recebidos
 * (top por rating). "Girar" baralha e revela outra no centro.
 */
export default function RoletaDeck({ restaurants = [], loading = false, error = false, anon = true, onPick, children }) {
  const [cards, setCards] = useState([]);
  const [phase, setPhase] = useState('idle'); // idle | hide | stack | riff | reveal
  const [tovi, setTovi] = useState(0);
  const [busy, setBusy] = useState(false);
  const alive = useRef(true);
  const last = useRef(null);

  useEffect(() => () => { alive.current = false; }, []);

  useEffect(() => {
    if (restaurants.length) setCards(sample(restaurants, Math.min(DECK, restaurants.length)));
  }, [restaurants]);

  const picked = cards[2] || cards[0];

  const spin = useCallback(async () => {
    if (busy || restaurants.length === 0) return;
    setBusy(true);
    const step = async (p, ms) => { if (!alive.current) return false; setPhase(p); setTovi((t) => (t + 1) % TOVIS.length); await sleep(ms); return alive.current; };
    if (!(await step('hide', 250))) return;
    if (!(await step('stack', 450))) return;
    for (let i = 0; i < 3; i++) {
      if (!(await step('riff', 260))) return;
      if (!(await step('stack', 260))) return;
    }
    const next = sample(restaurants, Math.min(DECK, restaurants.length), last.current);
    last.current = (next[2] || next[0])?.id ?? null;
    setCards(next);
    setPhase('reveal');
    await sleep(900);
    if (!alive.current) return;
    setPhase('idle');
    setBusy(false);
    onPick?.(next[2] || next[0]);
  }, [busy, restaurants, onPick]);

  if (loading) {
    return (
      <div className="roleta" aria-busy="true">
        <div className="roleta-deck" role="status" aria-label="A carregar restaurantes">
          {[0, 1, 2, 3, 4].map((k) => (
            <div key={k} className="roleta-card sk" style={{ '--i': k + 1 }}>
              <div className="roleta-cap"><span className="sk-line" /></div>
            </div>
          ))}
        </div>
        <div className="roleta-pick" />
        <div className="roleta-ctas">
          <button type="button" className="roleta-spin" disabled>
            <Ico name="dice" /> Girar
          </button>
          {children}
        </div>
      </div>
    );
  }
  if (error || restaurants.length === 0) {
    return (
      <div className="roleta-fb">
        <p>
          A roleta precisa de restaurantes.<br />
          <Link href="/restaurants/create" className="roleta-link">Sugere o primeiro</Link>
        </p>
        <div className="roleta-ctas">{children}</div>
      </div>
    );
  }

  const cls = ['roleta-deck'];
  if (phase !== 'idle' && phase !== 'reveal') cls.push('hide');
  if (phase === 'stack' || phase === 'riff') cls.push('stack');
  if (phase === 'riff') cls.push('riff');

  return (
    <div className="roleta">
      <div className={cls.join(' ')} style={{ '--tv': `url(/mascot/tovi-${TOVIS[tovi]}.svg)` }}>
        {cards.map((r, k) => {
          const img = photo(r);
          const d = phase === 'reveal' ? `${260 + [2, 1, 0, 1, 2][k] * 90}ms` : '0s';
          return (
            <div
              key={`${r.id}-${phase === 'reveal' ? 'r' : 'i'}`}
              className={`roleta-card${phase === 'reveal' ? ' flip' : ''}${img ? '' : ' none'}`}
              style={{ '--i': k + 1, '--d': d }}
            >
              {img && <img src={img} alt={`Foto de ${r.name}`} loading={k === 2 ? 'eager' : 'lazy'} />}
              <div className="roleta-cap"><span>{r.name}</span></div>
            </div>
          );
        })}
      </div>
      <div className="roleta-pick" aria-live="polite">
        {picked && !busy && (
          <>
            <Link href={`/restaurants/${picked.id}`} className="roleta-pick-name">{picked.name}</Link>
            <small>{anon ? 'Sai-te este. Cria conta para guardar.' : 'Sai-te este.'}</small>
          </>
        )}
        {busy && <span>A baralhar</span>}
      </div>
      <div className="roleta-ctas">
        <button type="button" className="roleta-spin" onClick={spin} disabled={busy}>
          <Ico name="dice" /> Girar
        </button>
        {children}
      </div>
    </div>
  );
}
