import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

const { LanguageProvider, useLanguage } = require('@/contexts/LanguageContext');

function Probe() {
  const { lang, t, setLang } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="known">{t('Restaurantes')}</span>
      <span data-testid="missing">{t('texto nao traduzido')}</span>
      <span data-testid="interp">{t('Não encontramos nenhum restaurante que corresponda a "{q}".', { q: 'Sushi' })}</span>
      <span data-testid="auth">{t('Bem-vindo de volta')}</span>
      <button onClick={() => setLang('en')}>to-en</button>
    </div>
  );
}

describe('LanguageContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to pt and returns PT strings', () => {
    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByTestId('lang').textContent).toBe('pt');
    expect(screen.getByTestId('known').textContent).toBe('Restaurantes');
    expect(screen.getByTestId('missing').textContent).toBe('texto nao traduzido');
    expect(screen.getByTestId('auth').textContent).toBe('Bem-vindo de volta');
  });

  it('interpolates params', () => {
    render(<LanguageProvider><Probe /></LanguageProvider>);
    const en = screen.getByTestId('interp').textContent;
    expect(en).toContain('Sushi');
    expect(en).toBe('Não encontramos nenhum restaurante que corresponda a "Sushi".');
  });

  it('switches to en and returns EN strings, missing falls back to PT', () => {
    render(<LanguageProvider><Probe /></LanguageProvider>);
    fireEvent.click(screen.getByText('to-en'));
    expect(screen.getByTestId('lang').textContent).toBe('en');
    expect(screen.getByTestId('known').textContent).toBe('Restaurants');
    expect(screen.getByTestId('missing').textContent).toBe('texto nao traduzido');
    expect(screen.getByTestId('auth').textContent).toBe('Welcome back');
    expect(localStorage.getItem('foodlister_lang')).toBe('en');
  });
});
