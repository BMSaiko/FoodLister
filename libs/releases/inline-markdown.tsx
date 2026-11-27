import React from 'react';

/**
 * Markdown inline mínimo para as notas de release: `código`, **negrito**, *itálico* e [texto](http(s)://…).
 * Tudo o resto é texto (o React escapa-o); nunca gera HTML cru.
 */
const TOKEN = /`([^`\n]+)`|\*\*([^*\n]+)\*\*|\*(?!\s)([^*\n]*[^*\s])\*|\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/gi;

export function parseInline(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(TOKEN)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    if (m[1] !== undefined) out.push(<code key={key++}>{m[1]}</code>);
    else if (m[2] !== undefined) out.push(<strong key={key++}>{m[2]}</strong>);
    else if (m[3] !== undefined) out.push(<em key={key++}>{m[3]}</em>);
    else
      out.push(
        <a key={key++} href={m[5]} target="_blank" rel="noopener noreferrer">
          {m[4]}
        </a>,
      );
    last = at + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function InlineMarkdown({ text }: { text: string }) {
  return <>{parseInline(text)}</>;
}
