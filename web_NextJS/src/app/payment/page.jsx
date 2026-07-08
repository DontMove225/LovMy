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
    <main className="min-h-screen bg-obsidian px-4 py-10">
      <div className="mx-auto max-w-xl rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
        <h1 className="font-serif text-3xl text-white">Paiement</h1>
        <p className="mt-3 text-[var(--txt-soft)]">Choisis PayPal ou Stripe pour payer.</p>

        <label className="mt-8 block text-sm font-medium text-[var(--txt-soft)]">
          Montant
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white/5 px-4 py-3 text-white outline-none focus:border-ember"
            placeholder="Montant en USD"
          />
        </label>

        {error ? <p className="mt-3 text-sm text-ember">{error}</p> : null}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => handleNavigate('paypal')}
            className="w-full rounded-2xl border border-[var(--line)] px-5 py-3 text-white transition hover:border-ember/40 hover:bg-ember/10"
          >
            Payer avec PayPal
          </button>
          <button
            type="button"
            onClick={() => handleNavigate('stripe')}
            className="w-full rounded-2xl bg-gradient-passion px-5 py-3 text-white shadow-[0_12px_30px_rgba(235,6,3,0.35)] transition hover:brightness-110"
          >
            Payer avec Stripe
          </button>
        </div>
      </div>
    </main>
  );
}
