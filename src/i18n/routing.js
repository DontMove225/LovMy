import { defineRouting } from 'next-intl/routing';

export const locales = ['fr', 'en', 'de', 'es', 'it', 'pt', 'pl', 'is', 'ja', 'ko', 'zh', 'ar', 'th'];

export const routing = defineRouting({
  locales,
  defaultLocale: 'fr',
  localePrefix: 'as-needed',
});
