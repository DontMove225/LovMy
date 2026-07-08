const testimonials = [
  {
    quote: 'On a matché un mardi soir. Trois mois plus tard, on emménageait ensemble.',
    name: 'Camille, 27 ans',
  },
  {
    quote: 'Les appels vidéo avant de se voir en vrai, ça change tout. Plus de mauvaises surprises.',
    name: 'Idriss, 31 ans',
  },
  {
    quote: 'Le matching est bluffant de pertinence. J’ai enfin arrêté de swiper dans le vide.',
    name: 'Léa, 24 ans',
  },
];

export default function Testimonials() {
  return (
    <section className="border-t border-[var(--line)] px-7 py-24">
      <div className="mx-auto max-w-content">
        <div className="mb-12 flex flex-wrap items-baseline gap-4">
          <span className="font-mono text-sm tracking-[0.2em] text-[var(--txt-faint)]">03</span>
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.32em] text-ember">Ils se sont trouvés</span>
            <h2 className="mt-2 font-serif text-4xl text-white sm:text-5xl">Never be lonely, pour de vrai</h2>
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
