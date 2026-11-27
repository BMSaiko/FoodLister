import React from 'react';
import { render } from '@testing-library/react';
import { InlineMarkdown } from '@/libs/releases/inline-markdown';

const html = (text: string) => render(<InlineMarkdown text={text} />).container.innerHTML;

describe('InlineMarkdown', () => {
  it('mantém texto simples', () => {
    expect(html('Mapa no detalhe')).toBe('Mapa no detalhe');
  });

  it('renderiza negrito, itálico e código', () => {
    expect(html('um **forte**, um *suave* e `código`')).toBe(
      'um <strong>forte</strong>, um <em>suave</em> e <code>código</code>',
    );
  });

  it('renderiza links http e https com rel seguro', () => {
    const out = html('ver [site](https://foodlister.pt/x?a=1&b=2) e [velho](http://exemplo.pt)');
    expect(out).toContain('<a href="https://foodlister.pt/x?a=1&amp;b=2" target="_blank" rel="noopener noreferrer">site</a>');
    expect(out).toContain('<a href="http://exemplo.pt" target="_blank" rel="noopener noreferrer">velho</a>');
  });

  it.each([
    ['javascript:', '[x](javascript:alert(1))'],
    ['data:', '[x](data:text/html;base64,PHNjcmlwdD4=)'],
    ['vbscript:', '[x](vbscript:msgbox(1))'],
    ['relativo', '[x](/admin)'],
    ['protocolo em maiúsculas disfarçado', '[x](JaVaScRiPt:alert(1))'],
  ])('não cria link para %s', (_n, md) => {
    expect(html(md)).not.toContain('<a');
    expect(html(md)).not.toContain('href');
  });

  it('escapa HTML cru em vez de o interpretar', () => {
    const out = html('<script>alert(1)</script> <img src=x onerror=alert(1)> **ok**');
    expect(out).not.toContain('<script');
    expect(out).not.toContain('<img');
    expect(out).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(out).toContain('<strong>ok</strong>');
  });

  it('não interpreta markdown dentro de código', () => {
    expect(html('`**x**`')).toBe('<code>**x**</code>');
  });

  it('deixa marcadores por fechar como texto', () => {
    expect(html('2 * 3 = 6 e **aberto')).toBe('2 * 3 = 6 e **aberto');
  });

  it('não usa dangerouslySetInnerHTML', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const src = require('fs').readFileSync(require.resolve('@/libs/releases/inline-markdown'), 'utf8');
    expect(src).not.toContain('dangerouslySetInnerHTML');
  });
});
