'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PaymentResponsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [method, setMethod] = useState('');

  useEffect(() => {
    setStatus(searchParams.get('status') || 'unknown');
    setMethod(searchParams.get('method') || 'unknown');
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 shadow-xl text-center">
        <h1 className="text-3xl font-semibold text-slate-900">Résultat du paiement</h1>
        <p className="mt-4 text-slate-600">Méthode : {method}</p>
        {status === 'success' ? (
          <p className="mt-6 text-xl font-semibold text-emerald-700">Paiement réussi !</p>
        ) : status === 'cancel' ? (
          <p className="mt-6 text-xl font-semibold text-rose-700">Paiement annulé.</p>
        ) : (
          <p className="mt-6 text-xl font-semibold text-slate-900">Statut inconnu.</p>
        )}
        <button
          onClick={() => router.push('/')}
          className="mt-8 rounded-2xl bg-slate-900 px-6 py-3 text-white hover:bg-slate-700"
        >
          Retour à l'accueil
        </button>
      </div>
    </main>
  );
}
