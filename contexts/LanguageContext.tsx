import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { LANGUAGES, EN, LanguageCode } from '@/libs/languages';

interface LanguageContextValue {
  lang: LanguageCode;
  setLang: (code: LanguageCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (ctx === undefined) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
};

const STORAGE_KEY = 'foodlister_lang';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<LanguageCode>('pt');

  // hydrate from localStorage on mount (avoid SSR mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
      if (saved && LANGUAGES.some((l) => l.code === saved)) setLangState(saved);
    } catch {}
  }, []);

  const setLang = useCallback((code: LanguageCode) => {
    setLangState(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch {}
  }, []);

  // keep <html lang> in sync with the selected language
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    let s = lang === 'en' ? EN[key] ?? key : key;
    if (params) {
      for (const [k, v] of Object.entries(params)) s = s.replace(`{${k}}`, String(v));
    }
    return s;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
  );
};
