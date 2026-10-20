import React from 'react';
import { render, screen } from '@testing-library/react';
import EmptyState from '@/components/ui/EmptyState';

describe('EmptyState', () => {
  it('mostra título, descrição e emote da Tovi', () => {
    const { container } = render(
      <EmptyState mascot="a-dormir" title="Sem nada" description="Volta mais tarde" />
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sem nada' })).toBeInTheDocument();
    expect(screen.getByText('Volta mais tarde')).toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('src', '/mascot/tovi-a-dormir.svg');
  });

  it('sem ação não renderiza CTA', () => {
    render(<EmptyState title="Vazio" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renderiza a ação quando fornecida', () => {
    render(<EmptyState title="Vazio" action={<a href="/map">Explorar</a>} />);
    expect(screen.getByRole('link', { name: 'Explorar' })).toHaveAttribute('href', '/map');
  });
});
