'use client';
import React from "react";
import { PhoneIcon } from "@/components/icons";
import MenuGallery from "./MenuGallery";

interface InfoBentoProps {
  menuImages?: string[];
  phoneNumbers?: string[];
}

/** Telefones adicionais e galeria do menu. Localização, site, menu e 1.º telefone estão no topo (HeroSection). */
export default function InfoBento({ menuImages = [], phoneNumbers = [] }: InfoBentoProps) {
  const extraPhones = phoneNumbers.slice(1);
  const hasMenuImages = menuImages.length > 0;
  if (extraPhones.length === 0 && !hasMenuImages) return null;

  return (
    <section className="mb-8">
      {extraPhones.length > 0 && (
        <div className="mb-4 space-y-1.5">
          {extraPhones.map((phone) => (
            <a
              key={phone}
              href={"tel:" + phone}
              className="flex items-center gap-3 min-h-[44px] p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-150"
            >
              <PhoneIcon size={18} className="text-white/45" />
              <span className="text-sm text-white/65">{phone}</span>
            </a>
          ))}
        </div>
      )}
      {hasMenuImages && <MenuGallery images={menuImages} restaurantName="Menu" />}
    </section>
  );
}
