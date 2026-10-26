import React, { useState, useRef, useCallback, type ReactNode } from "react";
import { categorizePriceLevel } from "@/utils/formatters";
import Modal from "@/components/ui/Modal";
import { CreatorLink } from "@/components/ui/common/CreatorLink";
import RestaurantActions from "@/components/ui/RestaurantDetails/RestaurantActions";
import { ExpandIcon, PinIcon, MenuBookIcon, PhoneIcon, GlobeIcon, StarIcon } from "@/components/icons";
import Icon from '@/components/ui/icons/Icon';

interface HeroSectionProps {
  restaurant: {
    id: string;
    name: string;
    images?: string[];
    display_image_index?: number;
    rating?: number;
    review_count?: number;
    price_per_person?: number;
    creator_name?: string;
    creator_id?: string;
    creator_user_code?: string | null;
    creator_display_name?: string | null;
    created_at?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    source_url?: string;
    menu_links?: string[];
    menu_images?: string[];
    phone_numbers?: string[];
  };
  /** T42: consolidated experience photos from all reviews, appended to main carousel */
  reviewImages?: string[];
  reviewCount?: number;
  /** Conteúdo por baixo das fotos (coluna esquerda); o painel fixo acompanha o scroll. */
  children?: React.ReactNode;
  onShare: () => void;
  onSchedule: () => void;
  /** «Avaliar»: abre o formulário de avaliação; ausente para visitantes sem sessão */
  onReview?: () => void;
  onEdit?: () => void;
  isOwner?: boolean;
  onDelete?: () => void;
  canDelete?: boolean;
  /** itens extra do menu «⋯» (ex.: T75 AddToList, denunciar) */
  actionExtra?: ReactNode;
  /** «Guardar numa lista»: só visível no painel desktop (≥1024 px) */
  listAction?: ReactNode;
}

const chipClass =
  "flex flex-none items-center gap-2 min-h-[44px] px-4 rounded-full border border-white/[0.1] bg-white/[0.05] text-sm text-white/85 hover:bg-white/[0.1] transition-colors";

export default function HeroSection({ restaurant, reviewImages, reviewCount, children, onShare, onSchedule, onReview, onEdit, isOwner, onDelete, canDelete, actionExtra, listAction }: HeroSectionProps) {
  const priceCategory = categorizePriceLevel(restaurant.price_per_person || 0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [slide, setSlide] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const allImages: string[] = [];
  if (restaurant.images?.length) {
    for (const img of restaurant.images) {
      if (img && img !== "/placeholder-restaurant.jpg" && !img.startsWith("data:image")) allImages.push(img);
    }
  }
  // ponytail (T42): append consolidated review photos to the main carousel
  if (reviewImages?.length) {
    for (const img of reviewImages) {
      if (img && !allImages.includes(img)) allImages.push(img);
    }
  }
  const hasImages = allImages.length > 0;
  const startIndex = restaurant.display_image_index ?? 0;

  const openLightbox = (i: number) => { setLightboxIndex(i); setLightboxOpen(true); };
  const closeLightbox = () => setLightboxOpen(false);
  const nextImg = () => setLightboxIndex(p => (p + 1) % allImages.length);
  const prevImg = () => setLightboxIndex(p => (p - 1 + allImages.length) % allImages.length);

  const goTo = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const child = el.children[i] as HTMLElement | undefined;
    if (child) el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: "smooth" });
  }, []);
  const onScroll = () => {
    const el = trackRef.current;
    if (!el || !el.children.length) return;
    const w = (el.children[0] as HTMLElement).offsetWidth || 1;
    setSlide(Math.min(allImages.length - 1, Math.max(0, Math.round(el.scrollLeft / w))));
  };

  const mapsHref = restaurant.latitude != null && restaurant.longitude != null
    ? `https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`
    : null;
  const menuHref = restaurant.menu_links?.[0];
  const hasMenuImages = (restaurant.menu_images ?? []).some(img => img && img !== "/placeholder-restaurant.jpg" && !img.startsWith("data:image"));
  const phone = restaurant.phone_numbers?.[0];
  const hasRating = restaurant.rating != null && (reviewCount ?? restaurant.review_count ?? 0) > 0;
  const count = reviewCount ?? restaurant.review_count ?? 0;

  return (
    <div className="lg:max-w-7xl lg:mx-auto lg:px-4 lg:pt-6 lg:grid lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-x-8 lg:items-start">
      <div className="min-w-0 lg:col-start-1 lg:row-start-1">
      {/* Carrossel (ou faixa de marca quando não há fotos) */}
      <div className="relative w-full lg:rounded-2xl lg:overflow-hidden">
        {hasImages ? (
          <>
            {/* Mosaico 1+3 (≥lg) */}
            <div data-testid="photo-mosaic" className="hidden lg:grid h-[480px] grid-cols-[2fr_1fr] gap-1.5">
              <button type="button" onClick={() => openLightbox(0)} aria-label={`Abrir foto 1 de ${allImages.length}`} className="row-span-3 overflow-hidden bg-[var(--card-bg)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={allImages[0]} alt={restaurant.name} className="h-full w-full object-cover" loading="eager" />
              </button>
              {allImages.slice(1, 4).map((img, i) => (
                <button key={img + i} type="button" onClick={() => openLightbox(i + 1)} aria-label={`Abrir foto ${i + 2} de ${allImages.length}`} className="overflow-hidden bg-[var(--card-bg)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`${restaurant.name} - Foto ${i + 2}`} className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
              <button
                type="button"
                onClick={() => openLightbox(0)}
                className="absolute right-3 bottom-3 flex items-center gap-2 min-h-[44px] px-4 rounded-full bg-black/60 backdrop-blur-md text-white text-sm font-medium"
              >
                {`Ver as ${allImages.length} fotos`}
              </button>
            </div>
            <div
              ref={trackRef}
              onScroll={onScroll}
              className="flex gap-1.5 overflow-x-auto snap-x snap-mandatory scrollbar-hide h-[260px] md:h-[420px] lg:hidden"
              aria-roledescription="carrossel"
              aria-label={`Fotos de ${restaurant.name}`}
            >
              {allImages.map((img, i) => (
                <button
                  key={img + i}
                  type="button"
                  onClick={() => openLightbox(i)}
                  aria-label={`Abrir foto ${i + 1} de ${allImages.length}`}
                  className="relative h-full flex-none snap-center w-[88%] md:w-[70%] lg:w-[60%] first:ml-0 overflow-hidden bg-[var(--card-bg)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={i === 0 ? restaurant.name : `${restaurant.name} - Foto ${i + 1}`}
                    className="h-full w-full object-cover"
                    loading={i <= startIndex + 1 ? "eager" : "lazy"}
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => openLightbox(slide)}
              aria-label="Ver fotos em ecrã inteiro"
              className="lg:hidden absolute left-3 bottom-3 flex items-center gap-2 min-h-[44px] px-4 rounded-full bg-black/60 backdrop-blur-md text-white text-sm font-medium"
            >
              {slide + 1} / {allImages.length}
              <ExpandIcon size={16} />
            </button>
          </>
        ) : (
          <div
            className="flex h-36 md:h-52 items-center justify-center"
            style={{ background: "var(--card-bg)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mascot/tovi-a-dormir.svg" alt="" aria-hidden="true" width={96} height={96} className="h-24 w-24 opacity-90" />
          </div>
        )}
      </div>

      {/* Miniaturas */}
      {hasImages && allImages.length > 1 && (
        <div className="lg:hidden max-w-7xl mx-auto px-4 pt-2">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            {allImages.map((img, i) => (
              <button
                key={img + i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir para a foto ${i + 1}`}
                className={
                  "flex-none h-11 w-11 rounded-lg overflow-hidden ring-2 transition-opacity " +
                  (i === slide ? "ring-amber-500" : "ring-transparent opacity-60 hover:opacity-100")
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      </div>

      {/* Painel: título, rating e preço, atalhos e ações (sticky no desktop) */}
      <div className="lg:sticky lg:top-20 min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2">
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-2 lg:p-0">
        {restaurant.creator_name && (
          <div className="text-sm text-white/45">
            Por <span className="text-white/70 font-medium"><CreatorLink creatorId={restaurant.creator_user_code || restaurant.creator_id} name={restaurant.creator_display_name || restaurant.creator_name} /></span>
          </div>
        )}
        <h1 className="mt-1 text-3xl md:text-5xl font-bold text-white tracking-tight leading-[1.1] text-balance">
          {restaurant.name}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/60">
          {hasRating && (
            <span className="flex items-center gap-1.5 font-semibold text-amber-400">
              <StarIcon size={18} />
              {(restaurant.rating || 0).toFixed(1).replace(".", ",")}
              <span className="font-normal text-white/45">({count})</span>
            </span>
          )}
          {restaurant.price_per_person != null && restaurant.price_per_person > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-amber-400">{"€".repeat(priceCategory.level)}</span>
              <span>€{restaurant.price_per_person.toFixed(0)} por pessoa</span>
            </span>
          )}
          {restaurant.location && <span className="truncate max-w-[14rem]">{restaurant.location}</span>}
        </div>

        {(mapsHref || menuHref || hasMenuImages || phone || restaurant.source_url) && (
          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
            {mapsHref && (
              <a href="#localizacao" className={chipClass}><PinIcon size={18} />Mapa</a>
            )}
            {hasMenuImages ? (
              <button
                type="button"
                onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className={chipClass}
              >
                <MenuBookIcon size={18} />Menu
              </button>
            ) : menuHref && (
              <a href={menuHref} target="_blank" rel="noopener noreferrer" className={chipClass}><MenuBookIcon size={18} />Menu</a>
            )}
            {phone && (
              <a href={`tel:${phone}`} className={chipClass}><PhoneIcon size={18} />Ligar</a>
            )}
            {restaurant.source_url && (
              <a href={restaurant.source_url} target="_blank" rel="noopener noreferrer" className={chipClass}><GlobeIcon size={18} />Site</a>
            )}
          </div>
        )}
      </div>

      {/* Ações: fixas acima da navegação em mobile, em linha no desktop */}
      <div className="max-w-7xl mx-auto px-4 lg:p-0 lg:mt-4">
        <div className="fixed inset-x-0 z-30 border-t border-white/[0.08] bg-[var(--background)] px-4 py-2.5 bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom))] md:static md:z-auto md:border-0 md:bg-transparent md:p-0 md:max-w-md lg:max-w-none">
          <RestaurantActions
            onReview={onReview ?? (() => undefined)}
            hideReview={!onReview}
            reviewHref="/auth/signin"
            onSchedule={onSchedule}
            onShare={onShare}
            onEdit={isOwner ? onEdit : undefined}
            onDelete={onDelete}
            canDelete={canDelete}
            menuExtra={actionExtra}
          />
        </div>
        {listAction && <div className="hidden lg:block mt-2 [&>*]:w-full">{listAction}</div>}
        {!onReview && (
          <p className="mt-2 text-sm text-white/55">Inicie sessão para avaliar e guardar em listas.</p>
        )}
      </div>
      </div>

      {children && (
        <div className="min-w-0 lg:col-start-1 lg:row-start-2 max-w-7xl mx-auto w-full px-4 lg:px-0 py-6 md:py-8 pb-24 md:pb-8">
          {children}
        </div>
      )}

      {/* Lightbox */}
      <Modal
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        variant="full-screen"
        closeOnBackdrop={false}
        ariaLabel="Lightbox de imagens do restaurante"
      >
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <button onClick={closeLightbox} aria-label="Fechar" className="absolute top-4 right-4 z-50 w-11 h-11 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] text-white/80 hover:bg-white/[0.15] transition-all duration-200 flex items-center justify-center cursor-pointer">
            <Icon name="fechar" className="h-5 w-5" />
          </button>
          {allImages.length > 1 && (
            <>
              <button onClick={prevImg} aria-label="Foto anterior" className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] text-white/80 hover:bg-white/[0.15] transition-all duration-200 flex items-center justify-center">
                <Icon name="chevron-esq" className="h-6 w-6" />
              </button>
              <button onClick={nextImg} aria-label="Foto seguinte" className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] text-white/80 hover:bg-white/[0.15] transition-all duration-200 flex items-center justify-center">
                <Icon name="chevron-dir" className="h-6 w-6" />
              </button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={allImages[lightboxIndex]} alt={`${restaurant.name} - Foto ${lightboxIndex + 1}`} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-xl text-white px-4 py-2 rounded-full text-sm font-medium border border-white/[0.08]">
            {lightboxIndex + 1} / {allImages.length}
          </div>
        </div>
      </Modal>
    </div>
  );
}
