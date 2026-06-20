import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GlobalSearch from '@/components/ui/GlobalSearch';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: () => <span data-testid="search-icon" />,
  X: () => <span data-testid="x-icon" />,
  Loader2: () => <span data-testid="loader-icon" />,
  Utensils: () => <span data-testid="utensils-icon" />,
  List: () => <span data-testid="list-icon" />,
  User: () => <span data-testid="user-icon" />,
}));

// Mock Supabase client
jest.mock('@/libs/supabase/client', () => ({
  getClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        ilike: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        eq: jest.fn(() => ({
          ilike: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
        or: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
  })),
}));

describe('GlobalSearch', () => {
  it('does not render when closed', () => {
    render(<GlobalSearch />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal when opened via keyboard shortcut', () => {
    render(<GlobalSearch />);

    // Simulate Cmd+K
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/pesquisa global/i)).toBeInTheDocument();
  });

  it('renders search input with correct aria attributes', () => {
    render(<GlobalSearch />);

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    const input = screen.getByPlaceholderText(/pesquisar restaurantes, listas, utilizadores/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('autocomplete', 'off');
  });

  it('shows placeholder text when query is empty', () => {
    render(<GlobalSearch />);

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    expect(
      screen.getByText(/escreva para pesquisar restaurantes, listas e utilizadores/i)
    ).toBeInTheDocument();
  });

  it('closes when close button is clicked', () => {
    render(<GlobalSearch />);

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/fechar pesquisa/i));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes when backdrop is clicked', () => {
    render(<GlobalSearch />);

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Click the backdrop (the div with aria-hidden)
    const backdrop = screen.getByTestId('x-icon')?.parentElement?.parentElement;
    if (backdrop) {
      // The backdrop is the first absolute inset-0 div
      const allDivs = document.querySelectorAll('.absolute.inset-0');
      if (allDivs.length > 0) {
        fireEvent.click(allDivs[0]);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      }
    }
  });

  it('has correct ARIA roles and attributes', () => {
    render(<GlobalSearch />);

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-live', 'polite');
  });

  it('shows no results message when query has no matches', async () => {
    render(<GlobalSearch />);

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    const input = screen.getByLabelText(/pesquisa global/i);
    fireEvent.change(input, { target: { value: 'xyznonexistent' } });

    await waitFor(() => {
      expect(screen.getByText(/sem resultados para/i)).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('shows result count in footer', () => {
    render(<GlobalSearch />);

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    // Default: 0 results
    expect(screen.getByText(/0 resultados/i)).toBeInTheDocument();
  });
});
