import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://lovmy.fr/api/';

async function getPage(id) {
  try {
    const res = await fetch(`${API_URL}page.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
      cache: 'no-store',
    });
    const json = await res.json();
    return json.Result === 'true' ? json.data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const page = await getPage(params.id);
  return { title: page?.title || 'Page' };
}

export default async function LegalPage({ params }) {
  const page = await getPage(params.id);

  return (
    <main className="min-h-screen bg-obsidian px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--txt-soft)] hover:text-white">
          <FiArrowLeft className="h-4 w-4" /> Retour à l&apos;accueil
        </Link>

        {page ? (
          <>
            <h1 className="font-serif text-4xl text-white">{page.title}</h1>
            <div className="mt-8 whitespace-pre-line text-[var(--txt-soft)] leading-relaxed">
              {page.description}
            </div>
          </>
        ) : (
          <p className="text-center text-[var(--txt-soft)]">Page introuvable.</p>
        )}
      </div>
    </main>
  );
}
