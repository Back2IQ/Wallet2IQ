import React, { createContext, useContext, useState } from 'react';
import de from './de';
import en from './en';

type Lang = 'de' | 'en';
const translations = { de, en };

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const I18nContext = createContext<I18nCtx>({ lang: 'de', setLang: () => {} });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem('lang') as Lang) || 'de',
  );
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  };
  return (
    <I18nContext.Provider value={{ lang, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const { lang, setLang } = useContext(I18nContext);
  const t = (key: string): string => {
    const keys = key.split('.');
    let val: any = translations[lang];
    for (const k of keys) val = val?.[k];
    return typeof val === 'string' ? val : key;
  };
  return { t, lang, setLang };
}
