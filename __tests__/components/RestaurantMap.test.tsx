import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

const map = { flyTo: jest.fn(), getCenter: jest.fn(() => ({ lat: 1, lng: 2 })), fitBounds: jest.fn(), invalidateSize: jest.fn(), getZoom: jest.fn(() => 12), on: jest.fn(), off: jest.fn(), closePopup: jest.fn() };

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div>{children}</div>,
  TileLayer: () => null,
  Marker: () => null,
  Popup: () => null,
  ZoomControl: ({ position }: any) => <div data-testid="zoom" data-position={position} />,
  useMap: () => map,
}));
jest.mock('react-leaflet-cluster', () => ({ __esModule: true, default: ({ children }: any) => <div>{children}</div> }));
jest.mock('react-leaflet-cluster/dist/assets/MarkerCluster.css', () => ({}), { virtual: true });
jest.mock('react-leaflet-cluster/dist/assets/MarkerCluster.Default.css', () => ({}), { virtual: true });

import RestaurantMap from '@/components/ui/RestaurantMap/RestaurantMap';

const r = (id: string, latitude: number, longitude: number) => ({ id, name: id, latitude, longitude }) as any;

describe('RestaurantMap controlos', () => {
  beforeEach(() => jest.clearAllMocks());

  it('zoom fica à direita (topright)', () => {
    render(<RestaurantMap restaurants={[r('a', 41.1, -8.6)]} />);
    expect(screen.getByTestId('zoom')).toHaveAttribute('data-position', 'topright');
  });

  it('botão de reset tem rótulo acessível, alvo 44 px e faz flyTo ao zoom 10', () => {
    render(<RestaurantMap restaurants={[r('a', 41.1, -8.6)]} />);
    const btn = screen.getByRole('button', { name: 'Reset map zoom' });
    expect(btn).toHaveClass('w-11', 'h-11');
    fireEvent.click(btn);
    expect(map.flyTo).toHaveBeenCalledWith({ lat: 1, lng: 2 }, 10, { duration: 1.5 });
  });

  it('enquadra os restaurantes com padding e maxZoom 15', () => {
    render(<RestaurantMap restaurants={[r('a', 41.1, -8.6), r('b', 41.2, -8.5)]} />);
    expect(map.fitBounds).toHaveBeenCalledTimes(1);
    expect(map.fitBounds.mock.calls[0][1]).toEqual({ padding: [48, 48], maxZoom: 15 });
  });

  it('sem restaurantes válidos não enquadra', () => {
    render(<RestaurantMap restaurants={[r('x', 999, 0)]} />);
    expect(map.fitBounds).not.toHaveBeenCalled();
  });
});
