import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('NotFound');

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-obsidian px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 78% 8%, rgba(235,6,3,.20), transparent 60%), radial-gradient(50% 40% at 12% 30%, rgba(48,59,99,.22), transparent 60%)',
        }}
      />
      <div className="relative max-w-md rounded-3xl border border-[var(--line)] bg-white/[0.03] p-10 text-center backdrop-blur-xl">
        <p className="font-serif text-6xl text-ember">404</p>
        <h1 className="mt-4 font-serif text-2xl text-white">{t('title')}</h1>
        <p className="mt-3 text-[var(--txt-soft)]">{t('description')}</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-2xl bg-gradient-passion px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(235,6,3,0.35)] transition hover:brightness-110"
        >
          {t('backHome')}
        </Link>
      </div>
    </main>
  );
}
