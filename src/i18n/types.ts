export interface TranslationDict {
  [key: string]: string | TranslationDict;
}

export const SUPPORTED_LOCALES = [
  { locale: 'en-US', label: 'English' },
  { locale: 'es-ES', label: 'Español' },
  { locale: 'fr-FR', label: 'Français' },
  { locale: 'ro-RO', label: 'Română' },
  { locale: 'de-DE', label: 'Deutsch' },
  { locale: 'pt-BR', label: 'Português (Brasil)' },
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]['locale'];
