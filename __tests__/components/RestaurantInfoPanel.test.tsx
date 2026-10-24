import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RestaurantInfoPanel from '@/components/ui/RestaurantDetails/RestaurantInfoPanel';

const restaurant = {
  id: 'r1',
  name: 'Tasca do Zé',
  location: 'Rua das Flores 12, Porto',
  price_per_person: 12.5,
  phone_numbers: ['+351 220 000 001', '+351 220 000 002'],
  cuisine_types: [{ cuisine_type: { id: 'c1', name: 'Portuguesa' } }],
  dietary_options: [{ dietary_option: { id: 'd1', name: 'Vegetariano' } }],
  features: [{ feature: { id: 'f1', name: 'Esplanada' } }],
  menu_url: 'https://tasca.pt/menu',
  source_url: 'https://tasca.pt',
  latitude: 41.15,
  longitude: -8.61,
  creator_name: 'Bruno',
  created_at: '2026-01-02T00:00:00Z',
  updated_at: '2026-02-03T00:00:00Z',
  rating: 4.5,
  review_count: 3,
  visited: true,
} as any;

describe('RestaurantInfoPanel', () => {
  it('mostra as linhas principais e esconde as restantes', () => {
    render(<RestaurantInfoPanel restaurant={restaurant} />);
    expect(screen.getByRole('heading', { name: 'Informações' })).toBeInTheDocument();
    expect(screen.getByText('Rua das Flores 12, Porto')).toBeInTheDocument();
    expect(screen.getByText('€12,50 por pessoa')).toBeInTheDocument();
    expect(screen.getByText('Portuguesa')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /220 000 002/ })).toHaveAttribute('href', 'tel:+351 220 000 002');
    expect(screen.getByRole('button', { name: /Ver mais informações/ })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByTestId('info-more')).toHaveAttribute('data-open', 'false');
  });

  it('«Ver mais informações» abre e fecha as linhas extra', () => {
    render(<RestaurantInfoPanel restaurant={restaurant} />);
    fireEvent.click(screen.getByRole('button', { name: /Ver mais informações/ }));
    expect(screen.getByRole('button', { name: /Ver menos/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('info-more')).toHaveAttribute('data-open', 'true');
    expect(screen.getByText('Vegetariano')).toBeInTheDocument();
    expect(screen.getByText('Esplanada')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'tasca.pt/menu' })).toHaveAttribute('href', 'https://tasca.pt/menu');
    fireEvent.click(screen.getByRole('button', { name: /Ver menos/ }));
    expect(screen.getByTestId('info-more')).toHaveAttribute('data-open', 'false');
  });

  it('campos em falta aparecem como «Não indicado», sem horário inventado', () => {
    render(<RestaurantInfoPanel restaurant={{ id: 'r2', name: 'Vazio', visited: false, created_at: '', updated_at: '' } as any} />);
    expect(screen.getAllByText('Não indicado').length).toBeGreaterThanOrEqual(4);
    expect(screen.queryByText('Horário')).not.toBeInTheDocument();
  });

  it('mostra a descrição quando existe', () => {
    render(<RestaurantInfoPanel restaurant={{ ...restaurant, description: 'Cozinha de tacho.' }} />);
    expect(screen.getByText('Cozinha de tacho.')).toBeInTheDocument();
  });
});
