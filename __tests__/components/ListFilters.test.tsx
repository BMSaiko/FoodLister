import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Filter: () => <span data-testid="filter-icon" />,
  X: () => <span data-testid="x-icon" />,
  Search: () => <span data-testid="search-icon" />,
  Star: () => <span data-testid="star-icon" />,
  ArrowUpDown: () => <span data-testid="arrow-up-down-icon" />,
}));

// Import after mocks
const ListFilters = require('@/components/ui/lists/ListFilters').default;

const mockProps = {
  onFilterChange: jest.fn(),
  onSortChange: jest.fn(),
  onClearFilters: jest.fn(),
  tags: ['restaurantes', 'viagem', 'família'],
};

describe('ListFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input', () => {
    render(<ListFilters {...mockProps} />);
    expect(screen.getByPlaceholderText('Pesquisar listas...')).toBeInTheDocument();
  });

  it('renders filter button', () => {
    render(<ListFilters {...mockProps} />);
    expect(screen.getByText('Filtros')).toBeInTheDocument();
  });

  it('shows filter options when button clicked', () => {
    render(<ListFilters {...mockProps} />);
    fireEvent.click(screen.getByText('Filtros'));
    expect(screen.getByText('Tags')).toBeInTheDocument();
    // "Rating Mínimo" text includes dynamic value, use regex
    expect(screen.getByText(/Rating Mínimo/)).toBeInTheDocument();
    expect(screen.getByText('Privacidade')).toBeInTheDocument();
  });

  it('displays tag buttons', () => {
    render(<ListFilters {...mockProps} />);
    fireEvent.click(screen.getByText('Filtros'));
    // "Todas" appears twice (Tags section and Privacidade section), use getAllByText
    const todasButtons = screen.getAllByText('Todas');
    expect(todasButtons.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('restaurantes')).toBeInTheDocument();
    expect(screen.getByText('viagem')).toBeInTheDocument();
    expect(screen.getByText('família')).toBeInTheDocument();
  });

  it('calls onFilterChange when search input changes', () => {
    render(<ListFilters {...mockProps} />);
    const input = screen.getByPlaceholderText('Pesquisar listas...');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(mockProps.onFilterChange).toHaveBeenCalled();
  });

  it('calls onClearFilters when clear button is clicked', () => {
    render(<ListFilters {...mockProps} />);
    fireEvent.click(screen.getByText('Filtros'));
    const input = screen.getByPlaceholderText('Pesquisar listas...');
    fireEvent.change(input, { target: { value: 'test' } });
    const clearButton = screen.getByText('Limpar filtros');
    fireEvent.click(clearButton);
    expect(mockProps.onClearFilters).toHaveBeenCalled();
  });
});