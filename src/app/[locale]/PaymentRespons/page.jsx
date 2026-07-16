'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function PaymentResponsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [method, setMethod] = useState('');

  useEffect(() => {
    setStatus(searchParams.get('status') || 'unknown');
    setMethod(searchParams.get('method') || 'unknown');
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-obsidian px-4 py-10">
      <div className="mx-auto max-w-xl rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8 text-center">
        <h1 className="font-serif text-3xl text-white">Résultat du paiement</h1>
        <p className="mt-4 text-[var(--txt-soft)]">Méthode : {method}</p>
        {status === 'success' ? (
          <p className="mt-6 text-xl font-semibold text-emerald-400">Paiement réussi !</p>
        ) : status === 'cancel' ? (
          <p className="mt-6 text-xl font-semibold text-ember">Paiement annulé.</p>
        ) : (
          <p className="mt-6 text-xl font-semibold text-white">Statut inconnu.</p>
        )}
        <button
          onClick={() => router.push('/')}
          className="mt-8 rounded-2xl bg-gradient-passion px-6 py-3 text-white shadow-[0_12px_30px_rgba(235,6,3,0.35)] transition hover:brightness-110"
        >
          Retour à l&apos;accueil
        </button>
      </div>
    </main>
  );
}

export default function PaymentResponsPage() {
  return (
    <Suspense fallback={null}>
      <PaymentResponsContent />
    </Suspense>
  );
}
