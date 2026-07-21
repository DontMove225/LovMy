import { SiAppstore, SiGoogleplay } from 'react-icons/si';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function DownloadCta() {
  const t = useTranslations('DownloadCta');

  return (
    <section id="telecharger" className="border-t border-[var(--line)] px-7 py-24">
      <div
        className="mx-auto max-w-content rounded-3xl border border-[var(--line)] p-10 text-center sm:p-16"
        style={{ background: 'linear-gradient(160deg, #15101f, #0a0712)' }}
      >
        <span className="font-mono text-xs uppercase tracking-[0.32em] text-ember">{t('eyebrow')}</span>
        <h2 className="mx-auto mt-4 max-w-xl font-serif text-4xl text-white sm:text-5xl">
          {t('title')}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[var(--txt-soft)]">
          {t('text')}
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <span className="flex cursor-not-allowed items-center gap-3 rounded-2xl border border-white/12 px-6 py-3 text-white/40">
            <SiAppstore className="h-6 w-6" />
            <span className="text-left text-sm leading-tight">
              <span className="block text-[10px] uppercase tracking-wide">{t('comingSoon')}</span>
              <span className="block font-semibold">{t('appStore')}</span>
            </span>
          </span>
          <span className="flex cursor-not-allowed items-center gap-3 rounded-2xl border border-white/12 px-6 py-3 text-white/40">
            <SiGoogleplay className="h-6 w-6" />
            <span className="text-left text-sm leading-tight">
              <span className="block text-[10px] uppercase tracking-wide">{t('comingSoon')}</span>
              <span className="block font-semibold">{t('googlePlay')}</span>
            </span>
          </span>
        </div>

        <Link
          href="/register"
          className="group relative mt-9 inline-flex overflow-hidden rounded-full bg-gradient-passion px-8 py-3.5 text-sm font-semibold text-white shadow-[0_10px_34px_-10px_rgba(246,65,53,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-12px_rgba(235,6,3,0.45)]"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <span className="relative">{t('cta')}</span>
        </Link>
      </div>
    </section>
  );
}
