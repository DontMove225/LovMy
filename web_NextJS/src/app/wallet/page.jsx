'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WalletPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    const data = localStorage.getItem('Register_User');
    if (!token || !data) {
      router.replace('/login');
      return;
    }
    setUser(JSON.parse(data));
  }, [router]);

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-slate-900">Mon wallet</h1>
        <p className="mt-4 text-slate-600">Cette page affichera les pièces et les paiements à venir.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Utilisateur</h2>
            <p className="mt-4 text-sm text-slate-600">{user.name || '-'}</p>
            <p className="mt-2 text-sm text-slate-600">{user.email || '-'}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Solde</h2>
            <p className="mt-4 text-4xl font-bold text-slate-900">0 Coins</p>
            <p className="mt-2 text-sm text-slate-600">Solde de départ, à connecter avec l'API plus tard.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
