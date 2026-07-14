import Link from 'next/link';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://lovmy.fr/api/';

async function getPageLinks() {
  try {
    const res = await fetch(`${API_URL}pagelist.php`, { method: 'POST', cache: 'no-store' });
    const json = await res.json();
    const pages = json.Result === 'true' ? (json.data || []) : [];

    const findId = (title) => pages.find((p) => p.title === title)?.id;

    return [
      { label: 'À propos', id: findId('À propos') },
      { label: 'Conditions Générales d’Utilisation', id: findId('Conditions Générales d\'Utilisation') },
      { label: 'Politique de Confidentialité', id: findId('Politique de Confidentialité') },
    ].filter((l) => l.id);
  } catch {
    return [];
  }
}

export default async function LandingFooter() {
  const legalPages = await getPageLinks();

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
            {legalPages.map((l) => (
              <Link key={l.id} href={`/pages/${l.id}`} className="text-xs text-[var(--txt-soft)] transition hover:text-white">
                {l.label}
              </Link>
            ))}
            <Link href="/faq" className="text-xs text-[var(--txt-soft)] transition hover:text-white">FAQ</Link>
            <Link href="/contact" className="text-xs text-[var(--txt-soft)] transition hover:text-white">Contact</Link>
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
