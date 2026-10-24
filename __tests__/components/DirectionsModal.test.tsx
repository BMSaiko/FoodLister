import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DirectionsModal, { directionsLinks, DIRECTIONS_PREF_KEY } from '@/components/ui/RestaurantDetails/DirectionsModal';

const place = { name: 'Tasca do Zé', location: 'Rua das Flores 12, Porto', latitude: 41.15, longitude: -8.61 };

describe('directionsLinks', () => {
  it('gera os URLs de Google Maps, Waze e Apple Maps', () => {
    const l = directionsLinks(place);
    expect(l.google).toBe('https://www.google.com/maps/dir/?api=1&destination=41.15,-8.61');
    expect(l.waze).toBe('https://waze.com/ul?ll=41.15,-8.61&navigate=yes');
    expect(l.apple).toBe(`https://maps.apple.com/?daddr=41.15,-8.61&q=${encodeURIComponent(place.location)}`);
  });
});

describe('DirectionsModal', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } });
  });

  it('mostra nome, morada e as quatro opções', () => {
    render(<DirectionsModal isOpen onClose={jest.fn()} place={place} />);
    expect(screen.getByText('Tasca do Zé')).toBeInTheDocument();
    expect(screen.getByText('Rua das Flores 12, Porto')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Google Maps/ })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: /Waze/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Apple Maps/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copiar morada/ })).toBeInTheDocument();
  });

  it('copiar morada escreve no clipboard e fecha', async () => {
    const onClose = jest.fn();
    render(<DirectionsModal isOpen onClose={onClose} place={place} />);
    fireEvent.click(screen.getByRole('button', { name: /Copiar morada/ }));
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Rua das Flores 12, Porto'));
    expect(onClose).toHaveBeenCalled();
  });

  it('lembrar escolha grava a app escolhida', () => {
    render(<DirectionsModal isOpen onClose={jest.fn()} place={place} />);
    fireEvent.click(screen.getByLabelText('Lembrar a minha escolha'));
    fireEvent.click(screen.getByRole('link', { name: /Waze/ }));
    expect(localStorage.getItem(DIRECTIONS_PREF_KEY)).toBe('waze');
  });

  it('sem lembrar, não grava nada', () => {
    render(<DirectionsModal isOpen onClose={jest.fn()} place={place} />);
    fireEvent.click(screen.getByRole('link', { name: /Google Maps/ }));
    expect(localStorage.getItem(DIRECTIONS_PREF_KEY)).toBeNull();
  });

  it('Cancelar fecha', () => {
    const onClose = jest.fn();
    render(<DirectionsModal isOpen onClose={onClose} place={place} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalled();
  });
});
