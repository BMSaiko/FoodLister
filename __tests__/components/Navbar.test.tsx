import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from '@/components/ui/navigation/Navbar';

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
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
  it('mostra o link «Novidades» para /novidades na navegação principal', () => {
    render(<Navbar />);
    expect(screen.getByRole('link', { name: 'Novidades' })).toHaveAttribute('href', '/novidades');
  });

  it('mantém os links existentes', () => {
    render(<Navbar />);
    expect(screen.getAllByRole('link', { name: 'Restaurantes' })[0]).toHaveAttribute('href', '/restaurants');
    expect(screen.getAllByRole('link', { name: 'Listas' })[0]).toHaveAttribute('href', '/lists');
  });
});
