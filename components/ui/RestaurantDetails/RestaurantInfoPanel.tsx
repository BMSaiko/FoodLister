'use client';
import React, { useState } from 'react';
import type { RestaurantDetail } from '@/hooks/restaurants/useRestaurantDetail';
import Icon from '@/components/ui/icons/Icon';

const NOT_SET = <span className="text-white/35 italic">Não indicado</span>;

const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('pt-PT') : '');
const bareUrl = (url: string) => url.replace(/^https?:\/\//, '');

function Row({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] gap-3 py-2.5 border-b border-white/[0.05] last:border-0 text-sm">
      <dt className="text-white/45">{label}</dt>
      <dd className="text-white/85 min-w-0 break-words">{children || NOT_SET}</dd>
    </div>
  );
}

function Tags({ items, pick, tone }: { items?: any[]; pick: string; tone: string }) {
  if (!items?.length) return null;
  return (
    <span className="flex flex-wrap gap-1.5">
      {items.map((it, i) => (
        <span key={it[pick]?.id || `${pick}-${i}`} className={`px-2.5 py-0.5 rounded-full text-xs border ${tone}`}>
          {it[pick]?.name || it.name}
        </span>
      ))}
    </span>
  );
}

function ExternalLink({ href }: { href?: string }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 underline-offset-2 hover:underline">
      {bareUrl(href)}
    </a>
  );
}

const AMBER = 'bg-amber-500/10 text-amber-400 border-amber-500/15';
const GREEN = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15';
const NEUTRAL = 'bg-white/[0.04] text-white/60 border-white/[0.06]';

/** Secção «Informações»: linhas principais sempre visíveis, restantes atrás de «Ver mais informações». */
export default function RestaurantInfoPanel({ restaurant }: { restaurant: RestaurantDetail }) {
  const [more, setMore] = useState(false);
  const r = restaurant;
  const hasRating = r.rating != null && (r.review_count ?? 0) > 0;
  const phones = r.phone_numbers ?? [];

  return (
    <section id="informacoes" className="mb-8 scroll-mt-20">
      {r.description && <p className="mb-4 text-base text-white/75 leading-relaxed">{r.description}</p>}
      <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/45 mb-3">Informações</h2>
      <dl className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4">
        <Row label="Morada">{r.location}</Row>
        <Row label="Preço médio">
          {r.price_per_person != null && `€${r.price_per_person.toFixed(2).replace('.', ',')} por pessoa`}
        </Row>
        <Row label="Cozinha"><Tags items={r.cuisine_types} pick="cuisine_type" tone={AMBER} /></Row>
        <Row label="Telefone">
          {phones.length > 0 && (
            <span className="flex flex-wrap gap-2">
              {phones.map((p) => (
                <a key={p} href={`tel:${p}`} className="inline-flex items-center min-h-[36px] px-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/80">
                  {p}
                </a>
              ))}
            </span>
          )}
        </Row>
        <div
          data-testid="info-more"
          data-open={more}
          className={`grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none ${more ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        >
          <div className="overflow-hidden" aria-hidden={!more}>
            {hasRating && <Row label="Avaliação">{`${r.rating!.toFixed(1)} / 5 · ${r.review_count} ${r.review_count === 1 ? 'avaliação' : 'avaliações'}`}</Row>}
            <Row label="Opções alimentares"><Tags items={r.dietary_options} pick="dietary_option" tone={GREEN} /></Row>
            <Row label="Características"><Tags items={r.features} pick="feature" tone={NEUTRAL} /></Row>
            <Row label="Website"><ExternalLink href={r.source_url} /></Row>
            <Row label="Menu online"><ExternalLink href={r.menu_url} /></Row>
            <Row label="Coordenadas">{r.latitude != null && r.longitude != null && `${r.latitude}, ${r.longitude}`}</Row>
            <Row label="Adicionado por">{r.creator_name || r.creator}</Row>
            <Row label="Adicionado em">{formatDate(r.created_at)}</Row>
            <Row label="Atualizado em">{formatDate(r.updated_at)}</Row>
          </div>
        </div>
      </dl>
      <button
        type="button"
        aria-expanded={more}
        onClick={() => setMore((v) => !v)}
        className="mt-3 inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl border border-white/[0.08] text-sm text-white/75 hover:bg-white/[0.04]"
      >
        {more ? 'Ver menos' : 'Ver mais informações'}
        <Icon name="chevron-baixo" className={`h-4 w-4 transition-transform motion-reduce:transition-none ${more ? 'rotate-180' : ''}`} aria-hidden />
      </button>
    </section>
  );
}
