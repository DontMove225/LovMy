'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

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
      <div className="mx-auto max-w-xl animate-rise rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8 text-center">
        {status === 'success' ? (
          <FiCheckCircle className="mx-auto h-14 w-14 text-emerald-400" />
        ) : status === 'cancel' ? (
          <FiXCircle className="mx-auto h-14 w-14 text-ember" />
        ) : null}
        <h1 className="mt-4 font-serif text-3xl text-white">Résultat du paiement</h1>
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
          className="group relative mt-8 overflow-hidden rounded-2xl bg-gradient-passion px-6 py-3 text-white shadow-[0_10px_34px_-10px_rgba(246,65,53,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-12px_rgba(235,6,3,0.45)]"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <span className="relative">Retour à l&apos;accueil</span>
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
