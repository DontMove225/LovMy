import Link from 'next/link';
import { SiAppstore, SiGoogleplay } from 'react-icons/si';


export default function DownloadCta() {
  return (
    <section id="telecharger" className="border-t border-[var(--line)] px-7 py-24">
      <div
        className="mx-auto max-w-content rounded-3xl border border-[var(--line)] p-10 text-center sm:p-16"
        style={{ background: 'linear-gradient(160deg, #15101f, #0a0712)' }}
      >
        <span className="font-mono text-xs uppercase tracking-[0.32em] text-ember">Où que vous soyez</span>
        <h2 className="mx-auto mt-4 max-w-xl font-serif text-4xl text-white sm:text-5xl">
          Emportez LovMy avec vous
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[var(--txt-soft)]">
          L&apos;application mobile arrive bientôt sur iOS et Android. En attendant, inscrivez-vous sur le web.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <span className="flex cursor-not-allowed items-center gap-3 rounded-2xl border border-white/12 px-6 py-3 text-white/40">
            <SiAppstore className="h-6 w-6" />
            <span className="text-left text-sm leading-tight">
              <span className="block text-[10px] uppercase tracking-wide">Bientôt sur</span>
              <span className="block font-semibold">App Store</span>
            </span>
          </span>
          <span className="flex cursor-not-allowed items-center gap-3 rounded-2xl border border-white/12 px-6 py-3 text-white/40">
            <SiGoogleplay className="h-6 w-6" />
            <span className="text-left text-sm leading-tight">
              <span className="block text-[10px] uppercase tracking-wide">Bientôt sur</span>
              <span className="block font-semibold">Google Play</span>
            </span>
          </span>
        </div>

        <Link
          href="/register"
          className="mt-9 inline-flex rounded-full bg-gradient-passion px-8 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(235,6,3,0.35)] transition hover:brightness-110"
        >
          S&apos;inscrire sur le web
        </Link>
      </div>
    </section>
  );
}
