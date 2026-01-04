import { useMemo } from 'react';
import { useAppContext } from '../components/AppContext';
import { translations } from './translations';
import type { TranslationDict } from './types';

function normalizeLocaleToLang(locale: string | undefined): string {
  if (!locale) return 'en';
  const base = locale.split('-')[0]?.toLowerCase();
  return base && translations[base] ? base : 'en';
}

function getPath(dict: TranslationDict, key: string): string | undefined {
  const parts = key.split('.');
  let cursor: string | TranslationDict | undefined = dict;

  for (const part of parts) {
    if (!cursor || typeof cursor === 'string') return undefined;
    cursor = cursor[part];
  }

  return typeof cursor === 'string' ? cursor : undefined;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) => {
    const val = vars[name];
    return val === undefined || val === null ? '' : String(val);
  });
}

export function createTranslator(locale: string) {
  const lang = normalizeLocaleToLang(locale);
  const dict = translations[lang] || translations.en;

  return (key: string, vars?: Record<string, string | number>) => {
    const raw = getPath(dict, key) ?? getPath(translations.en, key) ?? key;
    return interpolate(raw, vars);
  };
}

export function useI18n() {
  const { locale } = useAppContext();
  const t = useMemo(() => createTranslator(locale), [locale]);
  return { t, locale };
}
