'use client';

import React, { useState } from "react";
import Modal from '@/components/ui/Modal';
import Icon from '@/components/ui/icons/Icon';

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
    <section id="menu" className="scroll-mt-20 mt-11">
      <h2 className="mb-4 flex items-baseline gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">
        Menu
        <span className="normal-case tracking-normal text-white/35">{valid.length} {valid.length !== 1 ? "imagens" : "imagem"}</span>
      </h2>

      {/* Grelha */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
        {valid.map((img, i) => (
          <button key={i} onClick={() => { setIdx(i); setOpen(true); }} aria-label={`Abrir ${restaurantName} ${i + 1}`} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#0c0c0c] border border-white/[0.08] hover:border-white/25 transition-colors cursor-pointer">
            <img src={img} alt={`${restaurantName} ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <Modal isOpen={open} onClose={close} variant="full-screen"
        closeOnBackdrop={false} ariaLabel="Galeria de menu">
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <button onClick={close} className="absolute top-4 right-4 z-50 w-11 h-11 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] text-white/80 hover:bg-white/[0.15] transition-all duration-200 flex items-center justify-center hover:scale-110 cursor-pointer"><Icon name="fechar" className="h-5 w-5" /></button>
          {valid.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] text-white/80 hover:bg-white/[0.15] transition-all flex items-center justify-center hover:scale-110"><Icon name="chevron-esq" className="h-6 w-6" /></button>
              <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] text-white/80 hover:bg-white/[0.15] transition-all flex items-center justify-center hover:scale-110"><Icon name="chevron-dir" className="h-6 w-6" /></button>
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
      </Modal>
    </section>
  );
}
