import React from "react";

interface CategoryChipsProps {
  cuisineTypes?: any[];
  dietaryOptions?: any[];
  features?: any[];
}

export default function CategoryChips({
  cuisineTypes = [],
  dietaryOptions = [],
  features = []
}: CategoryChipsProps) {
  const hasAny = cuisineTypes.length > 0 || dietaryOptions.length > 0 || features.length > 0;
  if (!hasAny) return null;

  return (
    <section className="mb-6">
      <div className="flex flex-col gap-4">
        {cuisineTypes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">Culinaria</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {cuisineTypes.map((type, i) => (
                <span
                  key={type.cuisine_type?.id || ("cuisine-" + i)}
                  className="flex-shrink-0 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"
                >
                  {type.cuisine_type?.name || type.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {dietaryOptions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Opcoes Dieteticas</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {dietaryOptions.map((opt, i) => (
                <span
                  key={opt.dietary_option?.id || ("dietary-" + i)}
                  className="flex-shrink-0 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/20"
                >
                  {opt.dietary_option?.name || opt.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {features.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Caracteristicas</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {features.map((feat, i) => (
                <span
                  key={feat.feature?.id || ("feature-" + i)}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.05] text-white/60 border border-white/[0.08]"
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
