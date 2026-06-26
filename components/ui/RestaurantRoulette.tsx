"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Shuffle, X, ExternalLink, MapPin, Star, ChevronLeft, Sparkles, Trophy, RotateCcw } from "lucide-react";
import Link from "next/link";
import Modal from "./Modal";

interface Restaurant {
  id: string;
  name: string;
  image_url?: string;
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

export default function RestaurantRoulette({ restaurants, onClose }: RestaurantRouletteProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Typewriter effect for restaurant name during spin
  useEffect(() => {
    if (!isSpinning) return;
    const name = restaurants[currentIndex]?.name || "";
    if (name.length <= displayText.length) {
      setDisplayText(name);
      return;
    }
    const timer = setTimeout(() => {
      setDisplayText(name.slice(0, displayText.length + 1));
    }, 30);
    return () => clearTimeout(timer);
  }, [currentIndex, isSpinning]);

  const spin = useCallback(() => {
    if (isSpinning || restaurants.length === 0) return;
    setIsSpinning(true);
    setShowResult(false);
    setSelected(null);
    setDisplayText("");
    setSpinCount(p => p + 1);

    // Start from random position, not always 0
    let idx = Math.floor(Math.random() * restaurants.length);
    let speed = 50 + Math.floor(Math.random() * 30); // Random start speed
    const totalSpins = 30 + Math.floor(Math.random() * 20); // More randomness
    let completed = 0;

    const animate = () => {
      idx = (idx + 1) % restaurants.length;
      setCurrentIndex(idx);
      completed++;
      if (completed < totalSpins) {
        // Progressive slowdown with randomness
        if (completed > totalSpins * 0.7) {
          speed += 25 + Math.floor(Math.random() * 10);
        } else if (completed > totalSpins * 0.5) {
          speed += 10 + Math.floor(Math.random() * 5);
        } else if (completed > totalSpins * 0.3) {
          speed += 3;
        }
        // Ensure minimum speed to prevent infinite loops
        speed = Math.min(speed, 400);
        setTimeout(animate, speed);
      } else {
        setIsSpinning(false);
        setSelected(restaurants[idx]);
        setShowResult(true);
      }
    };
    animate();
  }, [isSpinning, restaurants]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSpinning) onClose();
      if (e.key === " " && !isSpinning) { e.preventDefault(); spin(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isSpinning, spin, onClose]);

  const current = restaurants[currentIndex];
  const imgUrl = current?.images?.[0] || current?.image_url;

  if (restaurants.length === 0) {
    return (
      <Modal isOpen={true} onClose={onClose} size="sm" ariaLabel="Sem restaurantes">
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">🎰</div>
          <h3 className="text-xl font-bold text-white/80 mb-2">Roleta de Restaurantes</h3>
          <p className="text-white/40">Nao ha restaurantes nesta lista para girar.</p>
          <button onClick={onClose} className="mt-6 px-6 py-2.5 rounded-full bg-white/[0.06] text-white/70 hover:bg-white/[0.1] transition-all duration-200 text-sm font-medium">Fechar</button>
        </div>
      </Modal>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/95 backdrop-blur-xl">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/[0.04] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg mx-4">
        {/* Close */}
        <button onClick={onClose} disabled={isSpinning} className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] text-white/60 hover:bg-white/[0.12] hover:text-white/90 transition-all duration-200 flex items-center justify-center z-10 disabled:opacity-30 hover:scale-110">
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/15 mb-4">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Roleta</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
            {isSpinning ? "A girar..." : showResult ? "Resultado!" : "Nao consegue decidir?"}
          </h2>
          <p className="text-sm text-white/35">
            {isSpinning ? "O destino esta a escolher..." : showResult ? "A roleta escolheu por si!" : "Deixe a roleta escolher o restaurante perfeito"}
          </p>
        </div>

        {/* Roulette Wheel Card */}
        <div className="relative mb-6">
          {/* Glow ring */}
          <div className={`absolute -inset-1 rounded-[28px] transition-all duration-500 ${isSpinning ? "bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-amber-500/30 blur-md animate-pulse" : showResult ? "bg-gradient-to-r from-emerald-500/30 via-amber-500/30 to-emerald-500/30 blur-md" : "bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 blur-sm"}`} />

          <div className="relative p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
            {/* Pointer */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <div className={`w-0 h-0 border-l-[10px] border-r-[10px] border-t-[12px] border-l-transparent border-r-transparent transition-colors duration-300 ${isSpinning ? "border-t-purple-500" : showResult ? "border-t-emerald-500" : "border-t-amber-500"}`} />
            </div>

            {/* Restaurant Display */}
            <div className={`text-center transition-all duration-200 ${isSpinning ? "scale-[0.97] opacity-80" : "scale-100 opacity-100"}`}>
              {/* Image */}
              <div className={`w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden ring-2 transition-all duration-300 ${isSpinning ? "ring-purple-500/30 shadow-lg shadow-purple-500/10" : showResult ? "ring-emerald-500/30 shadow-lg shadow-emerald-500/10" : "ring-white/[0.08]"}`}>
                {imgUrl ? (
                  <img src={imgUrl} alt={current?.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center">
                    <span className="text-4xl">🍽️</span>
                  </div>
                )}
              </div>

              {/* Name */}
              <h3 className={`text-xl md:text-2xl font-bold mb-2 transition-all duration-200 ${isSpinning ? "text-white/70" : "text-white"}`}>
                {isSpinning ? displayText : current?.name}
                {isSpinning && <span className="inline-block w-0.5 h-6 bg-purple-400 ml-1 animate-pulse" />}
              </h3>

              {/* Meta */}
              <div className="flex items-center justify-center gap-4 text-sm">
                {current?.rating != null && (
                  <span className="flex items-center gap-1.5 text-white/50">
                    <Star className="h-4 w-4 text-amber-400 fill-current" />
                    <span className="font-medium">{current.rating.toFixed(1)}</span>
                  </span>
                )}
                {current?.price_per_person != null && (
                  <span className="text-white/40 font-medium">€{current.price_per_person.toFixed(0)}</span>
                )}
              </div>
              {current?.location && (
                <p className="text-xs text-white/25 mt-1.5 flex items-center justify-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-[200px]">{current.location}</span>
                </p>
              )}

              {/* Cuisine chips */}
              {current?.cuisine_types && current.cuisine_types.length > 0 && (
                <div className="flex justify-center gap-1.5 mt-3">
                  {current.cuisine_types.slice(0, 3).map((c: any, i: number) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400/70 border border-amber-500/10">
                      {c.cuisine_type?.name || c.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Spin Button */}
        {!showResult && (
          <button
            onClick={spin}
            disabled={isSpinning}
            className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-300 min-h-[56px] ${
              isSpinning
                ? "bg-white/[0.06] text-white/30 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 text-white hover:shadow-xl hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            <Shuffle className={`h-5 w-5 ${isSpinning ? "animate-spin" : ""}`} />
            <span>{isSpinning ? "A girar..." : spinCount > 0 ? "Girar Novamente" : "Girar Roleta"}</span>
          </button>
        )}

        {/* Result */}
        {showResult && selected && (
          <div className="space-y-4 animate-[fadeUp_0.5s_ease-out]">
            {/* Celebration badge */}
            <div className="flex items-center justify-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" />
              <span className="text-sm font-semibold text-amber-400">Restaurante Selecionado!</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link
                href={`/restaurants/${selected.id}`}
                className="flex-1 py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-2xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <ExternalLink className="h-4 w-4" />
                Ver Restaurante
              </Link>
              <button
                onClick={() => { setShowResult(false); setSelected(null); setSpinCount(0); }}
                className="py-3.5 px-4 bg-white/[0.06] border border-white/[0.08] text-white/70 text-sm font-semibold rounded-2xl hover:bg-white/[0.1] transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <RotateCcw className="h-4 w-4" />
                Girar
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-[11px] text-white/20 mt-6">
          {restaurants.length} restaurante{restaurants.length !== 1 ? "s" : ""} na lista • Espaco para girar
        </p>
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