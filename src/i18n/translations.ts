import type { TranslationDict } from './types';
import { en } from './locales/en';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { ro } from './locales/ro';
import { de } from './locales/de';
import { pt } from './locales/pt';
import { zh } from './locales/zh';
import { ru } from './locales/ru';
import { ja } from './locales/ja';
import { pl } from './locales/pl';
import { ko } from './locales/ko';
import { tr } from './locales/tr';
import { hi } from './locales/hi';

export { SUPPORTED_LOCALES, type SupportedLocale, type TranslationDict } from './types';
export const translations: Record<string, TranslationDict> = {
  en,
  es,
  fr,
  ro,
  de,
  pt,
  zh,
  ru,
  ja,
  pl,
  ko,
  tr,
  hi,
};

