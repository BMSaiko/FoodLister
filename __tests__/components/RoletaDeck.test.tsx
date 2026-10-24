import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import RoletaDeck from '@/components/landing/RoletaDeck';

jest.mock('@/components/ui/icons/Ico', () => ({ __esModule: true, default: () => null }));

const restaurants = [1, 2, 3, 4, 5].map((n) => ({ id: `r${n}`, name: `Tasca ${n}`, images: [`/${n}.jpg`] }));

describe('RoletaDeck cartas clicáveis', () => {
  it('cada carta é um link para /restaurants/{id} com aria-label do nome', () => {
    render(<RoletaDeck restaurants={restaurants} />);
    for (const r of restaurants) {
      const link = screen.getByRole('link', { name: `Abrir ${r.name}` });
      expect(link).toHaveAttribute('href', `/restaurants/${r.id}`);
    }
  });

  it('durante o Girar as cartas não são links', () => {
    jest.useFakeTimers();
    render(<RoletaDeck restaurants={restaurants} />);
    fireEvent.click(screen.getByRole('button', { name: /Girar/ }));
    expect(screen.queryByRole('link', { name: /^Abrir / })).not.toBeInTheDocument();
    act(() => { jest.runAllTimers(); });
    jest.useRealTimers();
  });

  it('loading e vazio não têm cartas-link', () => {
    const { rerender } = render(<RoletaDeck loading />);
    expect(screen.queryByRole('link', { name: /^Abrir / })).not.toBeInTheDocument();
    rerender(<RoletaDeck restaurants={[]} />);
    expect(screen.queryByRole('link', { name: /^Abrir / })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sugere o primeiro' })).toBeInTheDocument();
  });
});
