import { render, screen, fireEvent } from '@testing-library/react';
import RestaurantFilters from '@/components/ui/Filters/RestaurantFilters';

const base = { visitedOnly: false, cuisines: [], priceMin: null, priceMax: null, ratingMin: null, location: '' };

describe('RestaurantFilters', () => {
  it('modo servidor: usa cuisineOptions e só emite o estado (sem onFiltered)', () => {
    const onFiltersChange = jest.fn();
    render(
      <RestaurantFilters variant="mock" cuisineOptions={['Italiana', 'Japonesa']} onFiltersChange={onFiltersChange} />
    );
    expect(screen.getByRole('button', { name: 'Italiana' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Japonesa' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Japonesa' }));
    expect(onFiltersChange).toHaveBeenLastCalledWith({ ...base, cuisines: ['Japonesa'] });
  });

  it('não chama onFiltersChange no arranque (deep-link já está no URL)', () => {
    const onFiltersChange = jest.fn();
    render(<RestaurantFilters variant="mock" cuisineOptions={['Italiana']} initialFilters={{ ...base, ratingMin: 4 }} onFiltersChange={onFiltersChange} />);
    expect(onFiltersChange).not.toHaveBeenCalled();
  });

  it('rating e localização emitem o filtro novo', () => {
    const onFiltersChange = jest.fn();
    render(<RestaurantFilters variant="mock" cuisineOptions={[]} onFiltersChange={onFiltersChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Filtros/ }));
    fireEvent.click(screen.getByLabelText('4 estrelas ou mais'));
    expect(onFiltersChange).toHaveBeenLastCalledWith({ ...base, ratingMin: 4 });
    fireEvent.change(screen.getByPlaceholderText('Cidade, país...'), { target: { value: 'Porto' } });
    expect(onFiltersChange).toHaveBeenLastCalledWith({ ...base, ratingMin: 4, location: 'Porto' });
  });

  it('onActiveChange reflete filtros ativos', () => {
    const onActiveChange = jest.fn();
    render(<RestaurantFilters variant="mock" cuisineOptions={['Italiana']} onActiveChange={onActiveChange} />);
    expect(onActiveChange).toHaveBeenLastCalledWith(false);
    fireEvent.click(screen.getByRole('button', { name: 'Italiana' }));
    expect(onActiveChange).toHaveBeenLastCalledWith(true);
  });

  it('modo cliente (roulette/listas): onFiltered continua a filtrar localmente', () => {
    const onFiltered = jest.fn();
    const restaurants = [
      { id: '1', name: 'A', visited: false, cuisine_types: [{ cuisine_type: { name: 'Italiana' } }] },
      { id: '2', name: 'B', visited: false, cuisine_types: [{ cuisine_type: { name: 'Japonesa' } }] },
    ];
    render(<RestaurantFilters variant="mock" restaurants={restaurants} onFiltered={onFiltered} />);
    fireEvent.click(screen.getByRole('button', { name: /Japonesa/ }));
    expect(onFiltered).toHaveBeenLastCalledWith([restaurants[1]]);
  });
});
