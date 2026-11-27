import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReleaseFeed from '@/components/releases/ReleaseFeed';
import { releaseSummary, formatReleaseDate } from '@/components/releases/helpers';
import type { ReleaseNote } from '@/libs/releases/types';

const note = (version: string, over: Partial<ReleaseNote['items']> = {}, releasedAt: string | null = '2026-11-20'): ReleaseNote => ({
  version,
  releasedAt,
  title: `Versão ${version}`,
  items: { novo: [], melhorado: [], corrigido: [], ...over },
});

describe('helpers', () => {
  it('resumo = 1.º Novo, senão Melhorado, senão Corrigido', () => {
    expect(releaseSummary(note('1.0.0', { novo: ['A'], melhorado: ['B'] }))).toBe('A');
    expect(releaseSummary(note('1.0.0', { melhorado: ['B'], corrigido: ['C'] }))).toBe('B');
    expect(releaseSummary(note('1.0.0', { corrigido: ['C'] }))).toBe('C');
    expect(releaseSummary(note('1.0.0'))).toBe('');
  });

  it('data por extenso em pt-PT; null devolve vazio', () => {
    expect(formatReleaseDate('2026-11-20')).toBe('20 de novembro de 2026');
    expect(formatReleaseDate(null)).toBe('');
  });
});

describe('ReleaseFeed', () => {
  const releases = [
    note('1.2.0', { novo: ['Página **Novidades**'], corrigido: ['Erro no mapa'] }),
    note('1.1.0', { melhorado: ['Mais rápido'] }, '2026-11-10'),
  ];

  it('mostra selo «Mais recente» só na primeira versão', () => {
    render(<ReleaseFeed releases={releases} />);
    expect(screen.getAllByText('Mais recente')).toHaveLength(1);
    expect(screen.getByRole('link', { name: /1\.2\.0/ })).toHaveAttribute('href', '/novidades/1.2.0');
  });

  it('mostra resumo e blocos por categoria', () => {
    render(<ReleaseFeed releases={releases} />);
    expect(screen.getByRole('heading', { name: 'Novo' })).toBeInTheDocument();
    expect(screen.getByText('Erro no mapa')).toBeInTheDocument();
  });

  it('filtro Corrigido esconde itens de outras categorias e versões sem correções', () => {
    render(<ReleaseFeed releases={releases} />);
    const btn = screen.getByRole('button', { name: 'Corrigido' });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Erro no mapa')).toBeInTheDocument();
    expect(screen.queryByText('Mais rápido')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /1\.1\.0/ })).not.toBeInTheDocument();
  });

  it('sem releases mostra estado vazio com Tovi a dormir', () => {
    const { container } = render(<ReleaseFeed releases={[]} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('src', '/mascot/tovi-a-dormir.svg');
  });

  it('não renderiza HTML cru vindo dos items', () => {
    const { container } = render(<ReleaseFeed releases={[note('2.0.0', { novo: ['<script>x</script>'] })]} />);
    expect(container.querySelector('script')).toBeNull();
  });
});
