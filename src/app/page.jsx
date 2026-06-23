'use client';

import Link from 'next/link';
import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MyContext } from '@/context/MyProvider';

export default function Home() {
  const { basUrl, imageBaseURL, paymentBaseURL } = useContext(MyContext);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      router.replace('/dashboard');
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 px-6 py-10">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
        <h1 className="text-4xl font-bold text-slate-900">LovMy V2</h1>
        <p className="mt-4 text-lg text-slate-600">
          Frontend Next.js de la plateforme LovMy. Ce projet est prêt pour démarrer la migration depuis React CRA.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-slate-400">
            <h2 className="text-2xl font-semibold">Connexion API</h2>
            <p className="mt-2 text-sm text-slate-600">Base API actuelle :</p>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-100 p-3 text-xs text-slate-700">{basUrl}</pre>
          </article>

          <article className="rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-slate-400">
            <h2 className="text-2xl font-semibold">Images</h2>
            <p className="mt-2 text-sm text-slate-600">Base image actuelle :</p>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-100 p-3 text-xs text-slate-700">{imageBaseURL}</pre>
          </article>

          <article className="rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-slate-400">
            <h2 className="text-2xl font-semibold">Paiements</h2>
            <p className="mt-2 text-sm text-slate-600">Base paiement actuelle :</p>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-100 p-3 text-xs text-slate-700">{paymentBaseURL}</pre>
          </article>
        </div>

        <div className="mt-10 space-y-3">
          <Link className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-white transition hover:bg-slate-700" href="/login">
            Page Login
          </Link>
          <Link className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-white transition hover:bg-slate-700" href="/register">
            Page Register
          </Link>
        </div>
      </div>
    </main>
  );
}
