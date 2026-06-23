'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleNavigate = (method) => {
    if (!amount || Number(amount) <= 0) {
      setError('Veuillez entrer un montant valide.');
      return;
    }
    setError('');
    router.push(`/${method}?amount=${encodeURIComponent(amount)}`);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-slate-900">Paiement</h1>
        <p className="mt-3 text-slate-600">Choisis PayPal ou Stripe pour payer.</p>

        <label className="mt-8 block text-sm font-medium text-slate-700">
          Montant
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
            placeholder="Montant en USD"
          />
        </label>

        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => handleNavigate('paypal')}
            className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-700"
          >
            Payer avec PayPal
          </button>
          <button
            type="button"
            onClick={() => handleNavigate('stripe')}
            className="w-full rounded-2xl bg-violet-600 px-5 py-3 text-white transition hover:bg-violet-700"
          >
            Payer avec Stripe
          </button>
        </div>
      </div>
    </main>
  );
}
