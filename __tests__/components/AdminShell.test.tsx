import { render, screen, fireEvent } from '@testing-library/react';
import AdminShell from '@/components/admin/AdminShell';

let mockPath = '/admin';
jest.mock('next/navigation', () => ({
  usePathname: () => mockPath,
}));

const renderShell = () =>
  render(
    <AdminShell>
      <p>conteudo</p>
    </AdminShell>
  );

describe('AdminShell (gaveta mobile)', () => {
  beforeEach(() => {
    mockPath = '/admin';
  });

  it('começa fechada e o botão abre a navegação', () => {
    renderShell();
    const toggle = screen.getByRole('button', { name: /abrir menu/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-controls', 'admin-nav');
    expect(screen.queryByTestId('admin-overlay')).toBeNull();

    fireEvent.click(toggle);

    expect(screen.getByRole('button', { name: /fechar menu/i })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('admin-overlay')).toBeInTheDocument();
  });

  it('fecha ao navegar', () => {
    const { rerender } = renderShell();
    fireEvent.click(screen.getByRole('button', { name: /abrir menu/i }));
    mockPath = '/admin/users';
    rerender(
      <AdminShell>
        <p>conteudo</p>
      </AdminShell>
    );
    expect(screen.getByRole('button', { name: /abrir menu/i })).toHaveAttribute('aria-expanded', 'false');
  });

  it('fecha com Esc e com toque fora', () => {
    renderShell();
    fireEvent.click(screen.getByRole('button', { name: /abrir menu/i }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('button', { name: /abrir menu/i })).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(screen.getByRole('button', { name: /abrir menu/i }));
    fireEvent.click(screen.getByTestId('admin-overlay'));
    expect(screen.getByRole('button', { name: /abrir menu/i })).toHaveAttribute('aria-expanded', 'false');
  });
});
