import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ListFilters from '@/components/ui/lists/ListFilters';

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
    expect(screen.getByText('Rating Mínimo')).toBeInTheDocument();
    expect(screen.getByText('Privacidade')).toBeInTheDocument();
  });

  it('displays tag buttons', () => {
    render(<ListFilters {...mockProps} />);
    fireEvent.click(screen.getByText('Filtros'));
    expect(screen.getByText('Todas')).toBeInTheDocument();
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