import type { TranslationDict } from './types';
import { en } from './locales/en';
import { es } from './locales/es';
import { fr } from './locales/fr';

export { SUPPORTED_LOCALES, type SupportedLocale, type TranslationDict } from './types';
export const translations: Record<string, TranslationDict> = {
  en,
  es,
  fr,
};

