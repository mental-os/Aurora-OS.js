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
  { locale: 'zh-CN', label: '中文（简体）' },
  { locale: 'ru-RU', label: 'Русский' },
  { locale: 'ja-JP', label: '日本語' },
  { locale: 'pl-PL', label: 'Polski' },
  { locale: 'ko-KR', label: '한국어' },
  { locale: 'tr-TR', label: 'Türkçe' },
  { locale: 'hi-IN', label: 'हिंदी (Hindi)' }
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]['locale'];
