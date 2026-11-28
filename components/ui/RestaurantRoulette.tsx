"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import Modal from "./Modal";
import Icon from "@/components/ui/icons/Icon";

interface Restaurant {
  id: string;
  name: string;
  slug?: string | null;
  images?: string[];
  rating?: number;
  price_per_person?: number;
  location?: string;
  cuisine_types?: any[];
}

interface RestaurantRouletteProps {
  restaurants: Restaurant[];
  onClose: () => void;
}

const MAX_SLICES = 8;
const SPIN_MS = 3200;

function sample(list: Restaurant[]): Restaurant[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, MAX_SLICES);
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function polar(angle: number, r: number): [number, number] {
  const rad = ((angle - 90) * Math.PI) / 180;
  return [100 + r * Math.cos(rad), 100 + r * Math.sin(rad)];
}

function slicePath(start: number, end: number): string {
  const [x1, y1] = polar(start, 96);
  const [x2, y2] = polar(end, 96);
  const large = end - start > 180 ? 1 : 0;
  return `M100 100 L${x1} ${y1} A96 96 0 ${large} 1 ${x2} ${y2} Z`;
}

function shortName(name: string): string {
  return name.length > 13 ? `${name.slice(0, 12)}…` : name;
}

export default function RestaurantRoulette({ restaurants, onClose }: RestaurantRouletteProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [spinCount, setSpinCount] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [slices, setSlices] = useState<Restaurant[]>(() => sample(restaurants));
  const rotationRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const spin = useCallback(() => {
    if (isSpinning || restaurants.length === 0) return;
    setSelected(null);
    setSpinCount((p) => p + 1);

    const winner = restaurants[Math.floor(Math.random() * restaurants.length)];
    let list = slices.length > 0 ? slices : sample(restaurants);
    let w = list.findIndex((r) => r.id === winner.id);
    if (w === -1) {
      w = Math.floor(Math.random() * list.length);
      list = list.map((r, i) => (i === w ? winner : r));
    }
    setSlices(list);

    const step = 360 / list.length;
    const target = -(w * step);
    const current = rotationRef.current;
    const delta = (((target - current) % 360) + 360) % 360;
    const next = current + 360 * 5 + delta;
    rotationRef.current = next;

    if (prefersReducedMotion()) {
      setRotation(next);
      setSelected(winner);
      return;
    }

    setIsSpinning(true);
    setRotation(next);
    timerRef.current = setTimeout(() => {
      setIsSpinning(false);
      setSelected(winner);
    }, SPIN_MS);
  }, [isSpinning, restaurants, slices]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSpinning) onClose();
      if (e.key === " " && !isSpinning) {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "BUTTON" || tag === "A") return;
        e.preventDefault();
        spin();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isSpinning, spin, onClose]);

  if (restaurants.length === 0) {
    return (
      <Modal isOpen={true} onClose={onClose} size="sm" ariaLabel="Sem restaurantes">
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">🎰</div>
          <h3 className="text-xl font-bold text-white/80 mb-2">Sem restaurantes</h3>
          <p className="text-white/40">Não há restaurantes nesta lista para girar.</p>
          <button onClick={onClose} className="mt-6 px-6 py-2.5 rounded-full bg-white/[0.06] text-white/70 hover:bg-white/[0.1] transition-all duration-200 text-sm font-medium">Fechar</button>
        </div>
      </Modal>
    );
  }

  const step = 360 / Math.max(slices.length, 1);
  const status = isSpinning ? "A girar…" : selected ? "Restaurante selecionado" : "Pronto";
  const imgUrl = selected?.images?.[0] || "";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#050505]/95 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Roleta de restaurantes">
      <div className="relative mx-auto w-full max-w-lg px-4 py-8">
        <button
          onClick={onClose}
          disabled={isSpinning}
          aria-label="Fechar"
          className="absolute right-4 top-4 w-11 h-11 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/60 hover:bg-white/[0.12] hover:text-white/90 transition-colors flex items-center justify-center disabled:opacity-30"
        >
          <Icon name="fechar" className="h-4 w-4" />
        </button>

        <div className="text-center mb-6 pt-2">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-500">Roleta</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-1">Onde vamos comer?</h2>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative w-[min(320px,80vw)] aspect-square">
            <div
              aria-hidden="true"
              className="absolute left-1/2 -top-3 z-10 -translate-x-1/2 w-0 h-0 border-l-[11px] border-r-[11px] border-t-[18px] border-l-transparent border-r-transparent border-t-amber-500"
            />
            <svg
              viewBox="0 0 200 200"
              role="img"
              aria-label={`Roda com ${slices.length} restaurantes de ${restaurants.length}`}
              className="w-full h-full rounded-full border-[6px] border-amber-500 bg-[#0c0c0c]"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? `transform ${SPIN_MS}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)` : "none",
              }}
            >
              {slices.length === 1 ? (
                <circle cx="100" cy="100" r="96" fill="rgba(245,158,11,0.12)" />
              ) : (
                slices.map((r, i) => {
                  const mid = i * step;
                  return (
                    <path
                      key={r.id}
                      d={slicePath(mid - step / 2, mid + step / 2)}
                      fill={i % 2 === 0 ? "rgba(245,158,11,0.16)" : "rgba(245,158,11,0.05)"}
                      stroke="rgba(245,158,11,0.25)"
                      strokeWidth="0.6"
                    />
                  );
                })
              )}
              {slices.map((r, i) => (
                <text
                  key={`t-${r.id}`}
                  x="50"
                  y="100"
                  dominantBaseline="middle"
                  fontSize="7.5"
                  fontWeight="700"
                  fill="rgba(255,255,255,0.85)"
                  transform={`rotate(${i * step - 90} 100 100)`}
                >
                  {shortName(r.name)}
                </text>
              ))}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[34%] aspect-square rounded-full bg-[#050505] border-[3px] border-amber-500 flex items-center justify-center text-2xl font-bold text-amber-500">
                {selected ? "✓" : "?"}
              </div>
            </div>
          </div>

          <p className="mt-6 min-h-[2.4em] max-w-[90%] text-center text-xl font-bold text-white" aria-live="polite" data-testid="roulette-status">
            {selected ? selected.name : status}
          </p>
          <p className="text-xs text-white/40" data-testid="roulette-count">
            {restaurants.length} restaurante{restaurants.length !== 1 ? "s" : ""} na lista
          </p>

          <button
            onClick={spin}
            disabled={isSpinning}
            className="mt-4 w-full min-h-[52px] rounded-2xl bg-amber-500 text-black font-bold text-base hover:bg-amber-400 active:scale-[0.98] transition disabled:bg-white/[0.06] disabled:text-white/30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <Icon name="baralhar" className="h-5 w-5" />
            <span>{isSpinning ? "A girar…" : spinCount > 0 ? "Girar novamente" : "Girar roleta"}</span>
          </button>
          <p className="mt-3 text-[11px] text-white/30">Espaço para girar · Esc para fechar</p>
        </div>

        {selected && !isSpinning && (
          <div
            data-testid="roulette-result"
            className="mt-6 rounded-3xl border-2 border-amber-500/70 bg-white/[0.03] p-4 text-center animate-[fadeUp_0.4s_ease-out] motion-reduce:animate-none"
            onTouchStart={(e) => { e.currentTarget.dataset.touchStart = `${e.touches[0].clientX}`; }}
            onTouchEnd={(e) => {
              const startX = parseFloat(e.currentTarget.dataset.touchStart || "0");
              if (Math.abs(startX - e.changedTouches[0].clientX) > 50) spin();
            }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-amber-500">Restaurante selecionado</span>
            <div className="mt-3 aspect-video w-full overflow-hidden rounded-2xl bg-amber-500/10 flex items-center justify-center">
              {imgUrl ? (
                <img src={imgUrl} alt={selected.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-5xl" aria-hidden="true">🍽️</span>
              )}
            </div>
            <h3 className="mt-3 text-2xl font-bold text-white break-words">{selected.name}</h3>
            <div className="mt-1 flex items-center justify-center gap-4 text-sm text-white/60">
              {selected.rating != null && (
                <span className="flex items-center gap-1.5">
                  <Icon name="estrela" className="h-4 w-4 text-amber-400 fill-current" />
                  <span className="font-medium">{selected.rating.toFixed(1)}</span>
                </span>
              )}
              {selected.price_per_person != null && <span className="font-medium">€{selected.price_per_person.toFixed(0)}</span>}
            </div>
            {selected.location && (
              <p className="mt-1.5 flex items-center justify-center gap-1 text-xs text-white/40">
                <Icon name="pin" className="h-3 w-3" />
                <span className="truncate max-w-[240px]">{selected.location}</span>
              </p>
            )}
            {selected.cuisine_types && selected.cuisine_types.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {selected.cuisine_types.slice(0, 3).map((c: any, i: number) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400/80 border border-amber-500/15">
                    {c.cuisine_type?.name || c.name}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-4 flex gap-3">
              <Link
                href={`/restaurants/${selected.slug || selected.id}`}
                className="flex-1 min-h-[52px] rounded-2xl bg-amber-500 text-black text-base font-bold flex items-center justify-center gap-2 hover:bg-amber-400 transition-colors"
              >
                <Icon name="externo" className="h-4 w-4" />
                Ver restaurante
              </Link>
              <button
                onClick={spin}
                className="min-h-[52px] px-4 rounded-2xl bg-white/[0.06] border border-white/[0.08] text-white/70 text-sm font-semibold hover:bg-white/[0.1] transition-colors flex items-center justify-center gap-2"
              >
                <Icon name="repor" className="h-4 w-4" />
                Girar de novo
              </button>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
