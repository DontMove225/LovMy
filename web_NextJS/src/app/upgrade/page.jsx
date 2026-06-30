'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UpgradePage() {
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
        <h1 className="text-3xl font-semibold text-slate-900">Pass Premium</h1>
        <p className="mt-4 text-slate-600">Bientôt disponible : options de mise à niveau et paiement.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Plan actuel</h2>
            <p className="mt-4 text-sm text-slate-600">Standard</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Prochaine étape</h2>
            <p className="mt-4 text-sm text-slate-600">Intégrer les pages de paiement Razorpay / PayPal plus tard.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
