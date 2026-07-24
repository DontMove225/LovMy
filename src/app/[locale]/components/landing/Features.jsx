import { FiTarget, FiShield, FiVideo, FiStar } from 'react-icons/fi';
import { useTranslations } from 'next-intl';

export default function Features() {
  const t = useTranslations('Features');
  const features = [
    { Icon: FiTarget, title: t('matchingTitle'), text: t('matchingText') },
    { Icon: FiShield, title: t('securityTitle'), text: t('securityText') },
    { Icon: FiVideo, title: t('videoTitle'), text: t('videoText') },
    { Icon: FiStar, title: t('premiumTitle'), text: t('premiumText') },
  ];

  return (
    <section id="fonctionnalites" className="border-t border-[var(--line)] px-7 py-24">
      <div className="mx-auto max-w-content">
        <div className="mb-12 flex flex-wrap items-baseline gap-4">
          <span className="font-mono text-sm tracking-[0.2em] text-[var(--txt-faint)]">02</span>
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.32em] text-ember">{t('eyebrow')}</span>
            <h2 className="mt-2 font-serif text-4xl text-white sm:text-5xl">{t('title')}</h2>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-[var(--line)] bg-white/[0.015] p-7">
              <div className="grid h-12 w-12 place-items-center rounded-xl border border-[var(--line)] bg-passion/5">
                <Icon className="h-6 w-6 stroke-[1.6] text-ember" />
              </div>
              <h3 className="mt-5 font-serif text-lg text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--txt-soft)]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
