import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RestaurantActions from '@/components/ui/RestaurantDetails/RestaurantActions';

const base = {
  onReview: jest.fn(),
  onSchedule: jest.fn(),
  onShare: jest.fn(),
};

describe('RestaurantActions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('mostra a ação principal e as secundárias com aria-label', () => {
    render(<RestaurantActions {...base} />);
    expect(screen.getByRole('button', { name: 'Avaliar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agendar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Partilhar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mais ações' })).toBeInTheDocument();
  });

  it('não expõe Eliminar fora do menu', () => {
    render(<RestaurantActions {...base} canDelete onDelete={jest.fn()} />);
    expect(screen.queryByRole('menuitem', { name: /Eliminar/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Eliminar/ })).not.toBeInTheDocument();
  });

  it('menu mostra Editar só ao dono/admin e Eliminar só a quem pode apagar', () => {
    const { rerender } = render(<RestaurantActions {...base} />);
    fireEvent.click(screen.getByRole('button', { name: 'Mais ações' }));
    expect(screen.queryByRole('menuitem', { name: 'Editar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /Eliminar/ })).not.toBeInTheDocument();

    rerender(<RestaurantActions {...base} onEdit={jest.fn()} canDelete onDelete={jest.fn()} />);
    expect(screen.getByRole('menuitem', { name: 'Editar' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Eliminar/ })).toBeInTheDocument();
  });

  it('Eliminar pede confirmação e só apaga ao confirmar', () => {
    const onDelete = jest.fn();
    render(<RestaurantActions {...base} canDelete onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: 'Mais ações' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Eliminar/ }));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onDelete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Mais ações' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Eliminar/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar restaurante' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('ações chamam os handlers', () => {
    render(<RestaurantActions {...base} />);
    fireEvent.click(screen.getByRole('button', { name: 'Avaliar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Agendar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Partilhar' }));
    expect(base.onReview).toHaveBeenCalledTimes(1);
    expect(base.onSchedule).toHaveBeenCalledTimes(1);
    expect(base.onShare).toHaveBeenCalledTimes(1);
  });
});
