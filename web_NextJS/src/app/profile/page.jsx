'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
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
        <h1 className="text-3xl font-semibold text-slate-900">Mon profil</h1>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Informations</h2>
            <p className="mt-4 text-sm text-slate-600"><span className="font-semibold">Nom :</span> {user.name || '-'}</p>
            <p className="mt-2 text-sm text-slate-600"><span className="font-semibold">Email :</span> {user.email || '-'}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Statut</h2>
            <p className="mt-4 text-sm text-slate-600">Authentifié via API LovMy.</p>
            <p className="mt-2 text-sm text-slate-600">Fichier de profil simplifié pour la V2.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
