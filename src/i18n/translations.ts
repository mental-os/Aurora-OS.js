import type { TranslationDict } from './types';
import { en } from './locales/en';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { ro } from './locales/ro';
import { de } from './locales/de';
import { pt } from './locales/pt';

export { SUPPORTED_LOCALES, type SupportedLocale, type TranslationDict } from './types';
export const translations: Record<string, TranslationDict> = {
  en,
  es,
  fr,
  ro,
  de,
  pt,
};

