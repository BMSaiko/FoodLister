import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RestaurantLocation from '@/components/ui/RestaurantDetails/RestaurantLocation';

jest.mock('next/dynamic', () => () => function MapStub() { return <div data-testid="map" />; });
jest.mock('@/components/ui/RestaurantDetails/DirectionsModal', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div data-testid="directions" /> : null),
}));

const base = { id: 'r1', name: 'Tasca do Zé', location: 'Rua das Flores 12, Porto', visited: true, created_at: '', updated_at: '' } as any;

describe('RestaurantLocation', () => {
  it('com coordenadas mostra mapa e abre «Como chegar»', () => {
    render(<RestaurantLocation restaurant={{ ...base, latitude: 41.15, longitude: -8.61 }} />);
    expect(screen.getByRole('heading', { name: 'Localização' })).toBeInTheDocument();
    expect(screen.getByTestId('map')).toBeInTheDocument();
    expect(screen.queryByTestId('directions')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Como chegar/ }));
    expect(screen.getByTestId('directions')).toBeInTheDocument();
  });

  it('sem coordenadas mostra só a morada', () => {
    render(<RestaurantLocation restaurant={base} />);
    expect(screen.queryByTestId('map')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Como chegar/ })).not.toBeInTheDocument();
    expect(screen.getByText('Rua das Flores 12, Porto')).toBeInTheDocument();
  });

  it('sem morada nem coordenadas não renderiza', () => {
    const { container } = render(<RestaurantLocation restaurant={{ ...base, location: undefined }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
