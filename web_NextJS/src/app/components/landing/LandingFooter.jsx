import Link from 'next/link';
import Image from 'next/image';

const legalLinks = [
  { label: 'Conditions générales d’utilisation', href: '/legal/cgu' },
  { label: 'Politique de confidentialité', href: '/legal/confidentialite' },
  { label: 'À propos', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-[var(--line)] px-7 py-16">
      <div className="mx-auto flex max-w-content flex-col items-center gap-8 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--txt-faint)]">
            Document de marque
          </span>
          <h3 className="mt-2 font-serif text-2xl text-white">LovMy</h3>
          <p className="mt-2 text-sm text-[var(--txt-soft)]">
            Édité par <b className="font-medium text-[var(--txt)]">Full IT</b>
          </p>
          <nav className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 sm:justify-start">
            {legalLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-xs text-[var(--txt-soft)] transition hover:text-white">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="text-center">
          <Image src="/logo-lovmy.png" alt="LovMy" width={64} height={64} className="mx-auto opacity-90" />
          <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.34em] text-blush">
            Never be lonely
          </div>
          <p className="mt-4 text-xs text-[var(--txt-faint)]">
            © {new Date().getFullYear()} LovMy — Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
}
