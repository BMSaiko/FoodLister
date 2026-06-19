import React from 'react';
import { render, screen } from '@testing-library/react';
import ListStatistics from '@/components/ui/lists/ListStatistics';

// Mock recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  Tooltip: () => null,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  PieChart: () => <span data-testid="pie-chart-icon" />,
  MapPin: () => <span data-testid="map-pin-icon" />,
  Star: ({ fill }: { fill?: string }) => <span data-testid="star-icon" fill={fill} />,
  CheckCircle2: () => <span data-testid="check-circle-icon" />,
  XCircle: () => <span data-testid="x-circle-icon" />,
  UtensilsCrossed: () => <span data-testid="utensils-icon" />,
}));

const mockRestaurants = [
  {
    id: '1',
    name: 'Restaurant A',
    rating: 4.5,
    price_per_person: 25,
    location: 'Lisbon',
    visited: true,
    cuisine_types: [{ id: '1', name: 'Portuguese' }],
  },
  {
    id: '2',
    name: 'Restaurant B',
    rating: 3.8,
    price_per_person: 15,
    location: 'Porto',
    visited: false,
    cuisine_types: [{ id: '2', name: 'Italian' }],
  },
  {
    id: '3',
    name: 'Restaurant C',
    rating: 4.2,
    price_per_person: 45,
    location: 'Lisbon',
    visited: true,
    cuisine_types: [{ id: '1', name: 'Portuguese' }, { id: '3', name: 'Japanese' }],
  },
];

describe('ListStatistics', () => {
  it('renders null when no restaurants', () => {
    const { container } = render(<ListStatistics restaurants={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('displays total restaurant count', () => {
    render(<ListStatistics restaurants={mockRestaurants} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Restaurantes')).toBeInTheDocument();
  });

  it('displays visited count', () => {
    render(<ListStatistics restaurants={mockRestaurants} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Visitados')).toBeInTheDocument();
  });

  it('displays unvisited count', () => {
    render(<ListStatistics restaurants={mockRestaurants} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Por Visitar')).toBeInTheDocument();
  });

  it('displays average rating', () => {
    render(<ListStatistics restaurants={mockRestaurants} />);
    expect(screen.getByText('4.2')).toBeInTheDocument();
    expect(screen.getByText('Rating Médio')).toBeInTheDocument();
  });

  it('displays progress percentage', () => {
    render(<ListStatistics restaurants={mockRestaurants} />);
    expect(screen.getByText(/67% visitado/)).toBeInTheDocument();
  });
});