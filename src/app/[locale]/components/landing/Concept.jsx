import { useTranslations } from 'next-intl';

export default function Concept() {
  const t = useTranslations('Concept');
  const values = [1, 2, 3].map((n) => ({
    label: t(`value${n}Label`),
    title: t(`value${n}Title`),
    text: t(`value${n}Text`),
  }));

  return (
    <section id="concept" className="border-t border-[var(--line)] px-7 py-24">
      <div className="mx-auto max-w-content">
        <div className="mb-12 flex flex-wrap items-baseline gap-4">
          <span className="font-mono text-sm tracking-[0.2em] text-[var(--txt-faint)]">01</span>
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.32em] text-ember">{t('eyebrow')}</span>
            <h2 className="mt-2 font-serif text-4xl text-white sm:text-5xl">{t('title')}</h2>
          </div>
        </div>

        <div className="grid overflow-hidden rounded-3xl border border-[var(--line)] md:grid-cols-2">
          <div className="p-10" style={{ background: 'linear-gradient(160deg, rgba(48,59,99,.30), rgba(8,7,20,.2))' }}>
            <span className="font-mono text-xs uppercase tracking-[0.26em] text-[#8aa0d8]">{t('techLabel')}</span>
            <h3 className="mt-3 font-serif text-2xl text-white">{t('techTitle')}</h3>
            <p className="mt-3 text-[var(--txt-soft)]">{t('techText')}</p>
          </div>
          <div className="p-10" style={{ background: 'linear-gradient(200deg, rgba(235,6,3,.18), rgba(128,0,1,.12))' }}>
            <span className="font-mono text-xs uppercase tracking-[0.26em] text-ember">{t('humanLabel')}</span>
            <h3 className="mt-3 font-serif text-2xl text-white">{t('humanTitle')}</h3>
            <p className="mt-3 text-[var(--txt-soft)]">{t('humanText')}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {values.map((v) => (
            <div key={v.label} className="rounded-2xl border border-[var(--line)] bg-white/[0.015] p-7">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-ember">{v.label}</span>
              <h3 className="mt-3 font-serif text-xl text-white">{v.title}</h3>
              <p className="mt-2 text-sm text-[var(--txt-soft)]">{v.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
