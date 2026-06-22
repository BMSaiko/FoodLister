"use client";

import React from "react";
import { Globe, Lock, MapPin, Star, List, ImageIcon } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  image_url?: string;
  rating?: number;
  location?: string;
}

interface ListFormPreviewProps {
  name: string;
  description?: string;
  isPublic?: boolean;
  coverImageUrl?: string;
  tags: string[];
  selectedRestaurants: Restaurant[];
}

export default function ListFormPreview({ name, description, isPublic, coverImageUrl, tags, selectedRestaurants }: ListFormPreviewProps) {
  const displayName = name || "Nome da Lista";
  const hasRestaurants = selectedRestaurants.length > 0;

  return (
    <div className="sticky top-24">
      <div className="p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
        <div className="p-2 rounded-2xl bg-white/[0.03]">
          <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-medium mb-3 px-2">Preview</p>

          {/* Cover */}
          <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3 bg-white/[0.03]">
            {coverImageUrl ? (
              <img src={coverImageUrl} alt="Capa" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                <ImageIcon className="h-10 w-10 text-white/10" />
              </div>
            )}
            {/* Privacy badge */}
            <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold backdrop-blur-xl border ${
              isPublic ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              {isPublic ? <><Globe className="w-3 h-3" />Publica</> : <><Lock className="w-3 h-3" />Privada</>}
            </div>
          </div>

          {/* Info */}
          <div className="px-2 pb-2">
            <h3 className="text-lg font-bold text-white/90 mb-1 truncate">{displayName}</h3>
            {description && <p className="text-xs text-white/40 line-clamp-2 mb-3">{description}</p>}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {tags.map((tag, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400/70 border border-amber-500/10">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-white/30 mb-3">
              <span className="flex items-center gap-1"><List className="w-3 h-3" />{selectedRestaurants.length} restaurantes</span>
            </div>

            {/* Restaurant preview */}
            {hasRestaurants && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {selectedRestaurants.slice(0, 4).map(r => (
                  <div key={r.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-white/[0.02]">
                    {r.image_url ? (
                      <img src={r.image_url} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">🍽️</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white/70 truncate">{r.name}</p>
                      {r.location && <p className="text-[10px] text-white/25 truncate">{r.location}</p>}
                    </div>
                    {r.rating != null && (
                      <span className="flex items-center gap-0.5 text-[10px] text-amber-400/60 flex-shrink-0">
                        <Star className="w-2.5 h-2.5 fill-current" />{r.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                ))}
                {selectedRestaurants.length > 4 && (
                  <p className="text-[10px] text-white/20 text-center py-1">+{selectedRestaurants.length - 4} mais</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
