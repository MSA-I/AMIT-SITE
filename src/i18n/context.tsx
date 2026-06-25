import React, { createContext, useContext, useEffect } from 'react';
import { he } from './he';
import { en } from './en';

export type Lang = 'he' | 'en';
const dicts = { he, en } as const;

export const isLang = (v: unknown): v is Lang => v === 'he' || v === 'en';
export const dictFor = (l: Lang) => dicts[l];

interface Ctx {
  lang: Lang;
  t: typeof he;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<Ctx>({ lang: 'he', t: he, dir: 'rtl' });

// eslint-disable-next-line react-refresh/only-export-components
export const useI18n = () => useContext(LanguageContext);

export function LanguageProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const t = dicts[lang];
  const dir = lang === 'he' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  return <LanguageContext.Provider value={{ lang, t, dir }}>{children}</LanguageContext.Provider>;
}
