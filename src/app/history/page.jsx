'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
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
        <h1 className="text-3xl font-semibold text-slate-900">Historique</h1>
        <p className="mt-3 text-slate-600">Historique des actions utilisateur.</p>
        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-slate-600">Données historiques à brancher sur l'API plus tard.</p>
        </div>
      </div>
    </main>
  );
}
