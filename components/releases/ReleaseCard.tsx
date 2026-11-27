import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { InlineMarkdown } from '@/libs/releases/inline-markdown';
import type { ReleaseCategory, ReleaseNote } from '@/libs/releases/types';
import { CATEGORIES, formatReleaseDate, releaseSummary } from './helpers';

const TONE: Record<ReleaseCategory, string> = {
  novo: 'border-l-4 border-[var(--success,#16a34a)]',
  melhorado: 'border-l-4 border-[var(--primary,#2563eb)]',
  corrigido: 'border-l-4 border-[var(--warning,#d97706)]',
};

interface Props {
  note: ReleaseNote;
  latest?: boolean;
  /** Categoria ativa no filtro; `null` = todas. */
  filter?: ReleaseCategory | null;
  /** Detalhe: sem link e sem resumo. */
  detail?: boolean;
}

export function ReleaseCategories({ note, filter = null }: { note: ReleaseNote; filter?: ReleaseCategory | null }) {
  return (
    <>
      {CATEGORIES.filter(({ key }) => (!filter || filter === key) && note.items[key].length > 0).map(({ key, label }) => (
        <section key={key} className={`mt-4 rounded-md bg-[var(--gray-50,transparent)] p-4 ${TONE[key]}`}>
          <h3 className="text-base font-semibold text-[var(--foreground)]">{label}</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-[17px] leading-[1.7] text-[var(--foreground)]">
            {note.items[key].map((item, i) => (
              <li key={i}>
                <InlineMarkdown text={item} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

export default function ReleaseCard({ note, latest = false, filter = null, detail = false }: Props) {
  const date = formatReleaseDate(note.releasedAt);
  const summary = releaseSummary(note);
  return (
    <Card as="article" className="p-5 sm:p-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          {detail ? (
            <h1 className="text-2xl font-bold text-[var(--foreground)]">{note.title}</h1>
          ) : (
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              <Link href={`/novidades/${note.version}`} className="inline-flex min-h-[44px] items-center hover:underline">
                {note.title} <span className="sr-only">({note.version})</span>
              </Link>
            </h2>
          )}
          {latest && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary-light,#dbeafe)] px-3 py-1 text-sm font-medium text-[var(--primary,#1d4ed8)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/mascot/tovi-a-celebrar.svg" alt="" aria-hidden="true" width={20} height={20} />
              Mais recente
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-[var(--gray-500)]">
          {date && <time dateTime={note.releasedAt ?? undefined}>{date}</time>}
          {date && ' · '}v{note.version}
        </p>
        {!detail && !filter && summary && (
          <p className="mt-3 max-w-[62ch] text-[17px] leading-[1.7] text-[var(--foreground)]">
            <InlineMarkdown text={summary} />
          </p>
        )}
      </header>
      <ReleaseCategories note={note} filter={filter} />
    </Card>
  );
}
