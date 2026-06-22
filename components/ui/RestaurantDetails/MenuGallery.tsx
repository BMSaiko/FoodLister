import React, { useState } from "react";
import { ImageIcon, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface MenuGalleryProps {
  images?: string[];
  restaurantName?: string;
}

export default function MenuGallery({ images = [], restaurantName = "Menu" }: MenuGalleryProps) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const valid = images.filter(img => img && img !== "/placeholder-restaurant.jpg" && !img.startsWith("data:image"));
  if (valid.length === 0) return null;

  const close = () => setOpen(false);
  const next = () => setIdx(p => (p + 1) % valid.length);
  const prev = () => setIdx(p => (p - 1 + valid.length) % valid.length);

  return (
    <section className="mb-4">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="bg-orange-500/10 rounded-xl p-2.5"><ImageIcon className="h-5 w-5 text-orange-400" /></div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">Menu</h2>
          <p className="text-xs text-white/35">{valid.length} imagem{valid.length !== 1 ? "ens" : "m"}</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {valid.map((img, i) => (
          <button key={i} onClick={() => { setIdx(i); setOpen(true); }} className="relative aspect-square rounded-2xl overflow-hidden bg-white/[0.03] ring-1 ring-white/[0.06] group cursor-pointer">
            <img src={img} alt={`${restaurantName} ${i + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.06]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/15 backdrop-blur-xl rounded-full p-2.5"><ZoomIn className="h-5 w-5 text-white" /></div>
            </div>
            <div className="absolute top-2 left-2 bg-black/30 backdrop-blur-md text-white/70 px-2 py-0.5 rounded-full text-[10px] font-semibold">{i + 1}</div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl" onClick={close}>
          <div className="relative w-full h-full flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
            <button onClick={close} className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] text-white/80 hover:bg-white/[0.15] transition-all duration-200 flex items-center justify-center hover:scale-110"><X className="h-5 w-5" /></button>
            {valid.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] text-white/80 hover:bg-white/[0.15] transition-all flex items-center justify-center hover:scale-110"><ChevronLeft className="h-6 w-6" /></button>
                <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] text-white/80 hover:bg-white/[0.15] transition-all flex items-center justify-center hover:scale-110"><ChevronRight className="h-6 w-6" /></button>
              </>
            )}
            <img src={valid[idx]} alt={`Menu ${idx + 1}`} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl transition-all duration-300" />
            {/* Thumbnail strip */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-xl rounded-full px-3 py-2 border border-white/[0.08]">
              <span className="text-xs text-white/60 font-medium mr-1">{idx + 1}/{valid.length}</span>
              {valid.map((img, i) => (
                <button key={i} onClick={() => setIdx(i)} className={"w-8 h-8 rounded-lg overflow-hidden ring-2 transition-all duration-200 " + (i === idx ? "ring-amber-500 scale-110" : "ring-transparent opacity-50 hover:opacity-80")}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
