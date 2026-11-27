import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ReleasePopup, { isPopupRoute } from '@/components/releases/ReleasePopup';

let mockPath = '/';
const mockPush = jest.fn();
const mockMarkSeen = jest.fn();
let mockRelease: { version: string; title: string } | null = { version: '1.4.0', title: 'Listas mais rápidas' };

jest.mock('next/navigation', () => ({
  usePathname: () => mockPath,
  useRouter: () => ({ push: mockPush }),
}));
jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (k: string) => k }),
}));
jest.mock('@/hooks/releases/useUnseenRelease', () => ({
  __esModule: true,
  default: () => ({ release: mockRelease, loading: false, markSeen: mockMarkSeen }),
}));

beforeEach(() => {
  window.scrollTo = jest.fn();
  mockPath = '/';
  mockRelease = { version: '1.4.0', title: 'Listas mais rápidas' };
  mockPush.mockClear();
  mockMarkSeen.mockClear();
});

it('mostra o popup com versão e título', () => {
  render(<ReleasePopup />);
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText(/1\.4\.0/)).toBeInTheDocument();
  expect(screen.getByText('Listas mais rápidas')).toBeInTheDocument();
});

it('não mostra sem release por ver', () => {
  mockRelease = null;
  render(<ReleasePopup />);
  expect(screen.queryByRole('dialog')).toBeNull();
});

it.each(['/auth/signin', '/auth/signup', '/subscribe/success', '/novidades', '/novidades/1.4.0'])(
  'não mostra em %s',
  (p) => {
    mockPath = p;
    expect(isPopupRoute(p)).toBe(false);
    render(<ReleasePopup />);
    expect(screen.queryByRole('dialog')).toBeNull();
  },
);

it('«Ver novidades» marca vista e navega para a release', () => {
  render(<ReleasePopup />);
  fireEvent.click(screen.getByRole('button', { name: 'Ver novidades' }));
  expect(mockMarkSeen).toHaveBeenCalledWith('1.4.0');
  expect(mockPush).toHaveBeenCalledWith('/novidades/1.4.0');
});

it('«Agora não» marca vista sem navegar', () => {
  render(<ReleasePopup />);
  fireEvent.click(screen.getByRole('button', { name: 'Agora não' }));
  expect(mockMarkSeen).toHaveBeenCalledWith('1.4.0');
  expect(mockPush).not.toHaveBeenCalled();
});

it('Esc fecha e marca vista', () => {
  jest.useFakeTimers();
  render(<ReleasePopup />);
  fireEvent.keyDown(document, { key: 'Escape' });
  act(() => { jest.advanceTimersByTime(200); });
  expect(mockMarkSeen).toHaveBeenCalledWith('1.4.0');
  jest.useRealTimers();
});
