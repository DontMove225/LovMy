import Link from 'next/link';

export const metadata = { title: 'Page introuvable' };

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 to-slate-100 px-4 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-xl text-center max-w-md">
        <p className="text-6xl font-black text-violet-600">404</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Page introuvable</h1>
        <p className="mt-3 text-slate-500">La page que vous recherchez n&apos;existe pas ou a été déplacée.</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-2xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
