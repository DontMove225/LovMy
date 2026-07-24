import { useTranslations } from 'next-intl';

export default function Testimonials() {
  const t = useTranslations('Testimonials');
  const testimonials = [1, 2, 3].map((n) => ({
    quote: t(`quote${n}`),
    name: t(`name${n}`),
  }));

  return (
    <section className="border-t border-[var(--line)] px-7 py-24">
      <div className="mx-auto max-w-content">
        <div className="mb-12 flex flex-wrap items-baseline gap-4">
          <span className="font-mono text-sm tracking-[0.2em] text-[var(--txt-faint)]">03</span>
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.32em] text-ember">{t('eyebrow')}</span>
            <h2 className="mt-2 font-serif text-4xl text-white sm:text-5xl">{t('title')}</h2>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-2xl border border-[var(--line)] bg-white/[0.015] p-8">
              <blockquote className="font-serif text-xl italic leading-snug text-blush">
                « {t.quote} »
              </blockquote>
              <figcaption className="mt-5 font-mono text-xs uppercase tracking-[0.14em] text-[var(--txt-faint)]">
                {t.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
