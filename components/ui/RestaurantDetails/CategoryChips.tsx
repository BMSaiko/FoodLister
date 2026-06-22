import React, { useRef, useEffect, useState } from "react";

interface CategoryChipsProps {
  cuisineTypes?: any[];
  dietaryOptions?: any[];
  features?: any[];
}

export default function CategoryChips({ cuisineTypes = [], dietaryOptions = [], features = [] }: CategoryChipsProps) {
  const hasAny = cuisineTypes.length > 0 || dietaryOptions.length > 0 || features.length > 0;
  if (!hasAny) return null;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsVisible(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={scrollRef} className="mb-8">
      <div className={`transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        {cuisineTypes.length > 0 && (
          <div className="mb-4">
            <span className="text-[10px] font-bold text-amber-400/70 uppercase tracking-[0.15em] mb-2 block">Culinaria</span>
            <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1">
              {cuisineTypes.map((type, i) => (
                <span
                  key={type.cuisine_type?.id || ("c-" + i)}
                  className="flex-shrink-0 snap-start inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-amber-500/10 text-amber-400 border border-amber-500/15 hover:bg-amber-500/20 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-200 cursor-default"
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  {type.cuisine_type?.name || type.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {dietaryOptions.length > 0 && (
          <div className="mb-4">
            <span className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-[0.15em] mb-2 block">Opcoes Dieteticas</span>
            <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1">
              {dietaryOptions.map((opt, i) => (
                <span
                  key={opt.dietary_option?.id || ("d-" + i)}
                  className="flex-shrink-0 snap-start inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 hover:bg-emerald-500/20 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-200 cursor-default"
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  {opt.dietary_option?.name || opt.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {features.length > 0 && (
          <div>
            <span className="text-[10px] font-bold text-white/35 uppercase tracking-[0.15em] mb-2 block">Caracteristicas</span>
            <div className="flex flex-wrap gap-2">
              {features.map((feat, i) => (
                <span
                  key={feat.feature?.id || ("f-" + i)}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.04] text-white/55 border border-white/[0.06] hover:bg-white/[0.08] hover:scale-105 hover:shadow-lg hover:shadow-white/5 transition-all duration-200 cursor-default"
                  style={{ transitionDelay: `${i * 30}ms` }}
                >
                  {feat.feature?.name || feat.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
