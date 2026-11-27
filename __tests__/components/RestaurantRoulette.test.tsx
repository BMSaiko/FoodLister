import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import RestaurantRoulette from '@/components/ui/RestaurantRoulette';

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  );
});
jest.mock('@/components/ui/Modal', () => ({ children }: any) => <div data-testid="modal">{children}</div>);
jest.mock('@/components/ui/icons/Icon', () => () => <span data-testid="icon" />);

const restaurants = [
  { id: '1', name: 'Restaurante Um', slug: 'um', rating: 4.5, price_per_person: 20, location: 'Porto', cuisine_types: [{ cuisine_type: { name: 'Italiana' } }] },
  { id: '2', name: 'Restaurante Dois', rating: 3.8, cuisine_types: [] },
  { id: '3', name: 'Nome muito longo de um restaurante qualquer', cuisine_types: [] },
];

function setReducedMotion(reduce: boolean) {
  window.matchMedia = jest.fn().mockImplementation((q: string) => ({
    matches: reduce && q.includes('reduce'),
    media: q,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })) as any;
}

describe('RestaurantRoulette', () => {
  beforeEach(() => { jest.useFakeTimers(); setReducedMotion(false); });
  afterEach(() => { jest.useRealTimers(); });

  it('mostra o estado inicial e a contagem', () => {
    render(<RestaurantRoulette restaurants={restaurants} onClose={jest.fn()} />);
    expect(screen.getByTestId('roulette-status')).toHaveTextContent('Pronto');
    expect(screen.getByTestId('roulette-count')).toHaveTextContent('3 restaurantes na lista');
    expect(screen.getByRole('button', { name: /Girar roleta/i })).toBeEnabled();
  });

  it('gira, desativa o botão e revela o resultado', () => {
    render(<RestaurantRoulette restaurants={restaurants} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Girar roleta/i }));
    expect(screen.getByTestId('roulette-status')).toHaveTextContent('A girar');
    expect(screen.queryByTestId('roulette-result')).toBeNull();
    act(() => { jest.advanceTimersByTime(3300); });
    const result = screen.getByTestId('roulette-result');
    expect(result).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ver restaurante/i })).toHaveAttribute('href', expect.stringMatching(/^\/restaurants\//));
    expect(screen.getByRole('button', { name: /Girar novamente/i })).toBeEnabled();
  });

  it('reduced-motion dá o resultado de imediato', () => {
    setReducedMotion(true);
    render(<RestaurantRoulette restaurants={restaurants} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Girar roleta/i }));
    expect(screen.getByTestId('roulette-result')).toBeInTheDocument();
  });

  it('Espaço gira e Esc fecha; Esc é ignorado a girar', () => {
    const onClose = jest.fn();
    render(<RestaurantRoulette restaurants={restaurants} onClose={onClose} />);
    fireEvent.keyDown(window, { key: ' ' });
    expect(screen.getByTestId('roulette-status')).toHaveTextContent('A girar');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
    act(() => { jest.advanceTimersByTime(3300); });
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('botão fechar fica desativado a girar', () => {
    render(<RestaurantRoulette restaurants={restaurants} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Girar roleta/i }));
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeDisabled();
  });

  it('swipe >50px no resultado volta a girar', () => {
    setReducedMotion(true);
    render(<RestaurantRoulette restaurants={restaurants} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Girar roleta/i }));
    const result = screen.getByTestId('roulette-result');
    fireEvent.touchStart(result, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(result, { changedTouches: [{ clientX: 100 }] });
    expect(screen.getByTestId('roulette-result')).toBeInTheDocument();
  });

  it('lista vazia mostra «Sem restaurantes» com Fechar', () => {
    const onClose = jest.fn();
    render(<RestaurantRoulette restaurants={[]} onClose={onClose} />);
    expect(screen.getByRole('heading', { name: 'Sem restaurantes' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('um só restaurante: resultado é esse', () => {
    setReducedMotion(true);
    render(<RestaurantRoulette restaurants={[restaurants[0]]} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Girar roleta/i }));
    expect(screen.getByRole('heading', { name: 'Restaurante Um' })).toBeInTheDocument();
    expect(screen.getByText('Italiana')).toBeInTheDocument();
  });
});
