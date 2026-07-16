'use client';

import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { usePathname, useRouter } from '@/i18n/navigation';

const LOCALE_LABELS = {
  fr: 'Français',
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  it: 'Italiano',
  pt: 'Português',
  pl: 'Polski',
  is: 'Íslenska',
  ja: '日本語',
  ko: '한국어',
  zh: '简体中文',
  ar: 'العربية',
  th: 'ไทย',
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const handleChange = (event) => {
    const nextLocale = event.target.value;
    router.replace({ pathname, params }, { locale: nextLocale });
  };

  return (
    <select
      aria-label="Language"
      value={locale}
      onChange={handleChange}
      className="rounded-full border border-[var(--line)] bg-transparent px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-[var(--txt-soft)] outline-none transition hover:border-blush hover:text-white [&>option]:bg-obsidian [&>option]:text-white"
    >
      {routing.locales.map((l) => (
        <option key={l} value={l}>
          {LOCALE_LABELS[l] ?? l.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
