import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LanguageSwitcher from '../LanguageSwitcher';

export default function Hero() {
  const t = useTranslations('Hero');
  const tNav = useTranslations('LandingHeader');

  return (
    <header className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 78% 8%, rgba(235,6,3,.20), transparent 60%), radial-gradient(50% 40% at 12% 30%, rgba(48,59,99,.22), transparent 60%), radial-gradient(70% 60% at 50% 120%, rgba(68,0,4,.55), transparent 70%)',
        }}
      />

      <div className="relative mx-auto flex max-w-content items-center justify-between px-7 py-8">
        <Link href="/" className="font-mono text-xs uppercase tracking-[0.34em] text-[var(--txt-soft)]">
          LovMy
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#concept" className="text-sm text-[var(--txt-soft)] transition hover:text-white">{tNav('concept')}</a>
          <a href="#fonctionnalites" className="text-sm text-[var(--txt-soft)] transition hover:text-white">{tNav('features')}</a>
          <a href="#telecharger" className="text-sm text-[var(--txt-soft)] transition hover:text-white">{tNav('download')}</a>
        </nav>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            href="/login"
            className="rounded-full border border-blush/40 px-5 py-2 text-sm font-medium text-white transition hover:border-blush"
          >
            {tNav('login')}
          </Link>
        </div>
      </div>

      <div className="relative mx-auto grid max-w-content items-center gap-10 px-7 pb-24 pt-10 md:grid-cols-2 md:pb-28 md:pt-16">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.32em] text-ember">
            {t('kicker')}
          </span>
          <h1 className="mt-5 font-serif text-6xl leading-[1.04] tracking-tight text-white sm:text-7xl">
            Lov<em className="italic text-ember">My</em>
          </h1>
          <p className="mt-6 flex items-center gap-4 font-mono text-sm uppercase tracking-[0.34em] text-blush sm:text-base">
            <span className="h-px w-9 bg-gradient-to-r from-ember to-transparent" />
            {t('tagline')}
          </p>
          <p className="mt-4 max-w-md font-serif text-xl italic text-[var(--txt-soft)]">
            {t('subtitle')}
          </p>
          <p className="mt-6 max-w-md text-base text-[var(--txt-soft)]">
            {t('description')}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="rounded-full bg-gradient-passion px-8 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(235,6,3,0.35)] transition hover:brightness-110"
            >
              {t('ctaRegister')}
            </Link>
            <a
              href="#telecharger"
              className="rounded-full border border-blush/40 px-8 py-3.5 text-sm font-semibold text-white transition hover:border-blush"
            >
              {t('ctaDownload')}
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-7 font-mono text-xs uppercase tracking-[0.14em] text-[var(--txt-faint)]">
            <span>{t('publisher')} <b className="font-medium text-[var(--txt)]">{t('publisherName')}</b></span>
            <span>{t('security')} <b className="font-medium text-[var(--txt)]">{t('securityValue')}</b></span>
          </div>
        </div>

        <div className="relative mx-auto grid aspect-square w-full max-w-md place-items-center">
          <div className="absolute inset-[8%] animate-heart-glow rounded-full blur-md" style={{ background: 'radial-gradient(circle, rgba(246,65,53,.45), rgba(128,0,1,.10) 55%, transparent 72%)' }} />
          <Image
            src="/logo-lovmy.png"
            alt="Logo LovMy"
            width={440}
            height={440}
            priority
            className="relative w-[78%] drop-shadow-[0_26px_60px_rgba(235,6,3,0.30)]"
          />
        </div>
      </div>
    </header>
  );
}
