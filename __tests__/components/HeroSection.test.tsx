import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HeroSection from '@/components/ui/RestaurantDetails/HeroSection';

jest.mock('@/components/ui/Modal', () => ({ __esModule: true, default: ({ isOpen, children }: any) => (isOpen ? <div>{children}</div> : null) }));
jest.mock('@/components/ui/common/CreatorLink', () => ({ CreatorLink: ({ name }: any) => <span>{name}</span> }));

const restaurant = {
  id: 'r1',
  name: 'Tasca do Zé',
  images: ['/a.jpg', '/b.jpg', '/c.jpg', '/d.jpg', '/e.jpg'],
};
const handlers = { onShare: jest.fn(), onSchedule: jest.fn() };

describe('HeroSection', () => {
  it('mosaico mostra a foto principal + 3 e «Ver as N fotos» abre a lightbox', () => {
    render(<HeroSection restaurant={restaurant} {...handlers} />);
    const mosaic = screen.getByTestId('photo-mosaic');
    expect(mosaic.querySelectorAll('img')).toHaveLength(4);
    fireEvent.click(screen.getByRole('button', { name: 'Ver as 5 fotos' }));
    expect(screen.getByAltText('Tasca do Zé - Foto 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument();
  });

  it('sem fotos não há mosaico nem botão', () => {
    render(<HeroSection restaurant={{ ...restaurant, images: [] }} {...handlers} />);
    expect(screen.queryByTestId('photo-mosaic')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ver as/ })).not.toBeInTheDocument();
  });

  it('visitante vê «Avaliar» para /auth/signin e a nota de sessão', () => {
    render(<HeroSection restaurant={restaurant} {...handlers} />);
    expect(screen.getByRole('link', { name: 'Avaliar' })).toHaveAttribute('href', '/auth/signin');
    expect(screen.getByText('Inicie sessão para avaliar e guardar em listas.')).toBeInTheDocument();
  });

  it('com sessão não mostra a nota', () => {
    render(<HeroSection restaurant={restaurant} {...handlers} onReview={jest.fn()} />);
    expect(screen.queryByText(/Inicie sessão/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Avaliar' })).toBeInTheDocument();
  });
});
