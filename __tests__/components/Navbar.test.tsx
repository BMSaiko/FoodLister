import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from '@/components/ui/navigation/Navbar';

let mockPath = '/';
jest.mock('next/navigation', () => ({
  usePathname: () => mockPath,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), refresh: jest.fn() }),
}));
jest.mock('@/contexts', () => ({
  useAuth: () => ({ user: null, loading: false, signOut: jest.fn() }),
  useFilters: () => ({}),
}));
jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (s: string) => s, language: 'pt', setLanguage: jest.fn() }),
}));
jest.mock('@/components/ui/GlobalSearch', () => ({ openGlobalSearch: jest.fn() }));
jest.mock('@/libs/supabase/client', () => ({ getClient: () => ({ from: jest.fn(), auth: { getUser: jest.fn() } }) }));
jest.mock('@/hooks/data/useNotifications', () => ({
  __esModule: true,
  default: () => ({ notifications: [], unreadCount: 0, markAsRead: jest.fn(), markAllAsRead: jest.fn() }),
}));
jest.mock('@/components/ui/navigation/NotificationsDropdown', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/ui/navigation/LanguageCombobox', () => ({ __esModule: true, default: () => null }));

describe('Navbar', () => {
  afterEach(() => {
    mockPath = '/';
  });

  it.each(['/novidades', '/novidades/1.2.0'])('marca «Novidades» como ativo em %s (e não Restaurantes)', (path) => {
    mockPath = path;
    render(<Navbar />);
    for (const l of screen.getAllByRole('link', { name: 'Novidades' })) expect(l).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByRole('link', { name: 'Restaurantes' })[0]).not.toHaveAttribute('aria-current');
  });

  it('mostra o link «Novidades» para /novidades na navegação principal', () => {
    render(<Navbar />);
    expect(screen.getAllByRole('link', { name: 'Novidades' })[0]).toHaveAttribute('href', '/novidades');
  });

  it('tem o ícone «Novidades» do cabeçalho mobile (sem sessão)', () => {
    render(<Navbar />);
    const links = screen.getAllByRole('link', { name: 'Novidades' });
    expect(links.some((l) => l.className.includes('md:hidden'))).toBe(true);
  });

  it('mantém os links existentes', () => {
    render(<Navbar />);
    expect(screen.getAllByRole('link', { name: 'Restaurantes' })[0]).toHaveAttribute('href', '/restaurants');
    expect(screen.getAllByRole('link', { name: 'Listas' })[0]).toHaveAttribute('href', '/lists');
  });
});
