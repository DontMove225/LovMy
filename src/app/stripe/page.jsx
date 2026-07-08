'use client';

import { Suspense, useContext, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { MyContext } from '@/context/MyProvider';

const stripePromise = loadStripe('pk_test_6pRNASCoBOKtIshFeOQq4XMUh');

function StripeForm({ amount, type, planId, packageId }) {
  const { apiPost, getStoredUser } = useContext(MyContext);
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    const card = elements.getElement(CardElement);
    if (!card) return;

    setIsProcessing(true);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card,
    });

    if (error) {
      setMessage(error.message || 'Erreur Stripe');
      setIsProcessing(false);
      return;
    }

    try {
      const me = getStoredUser();
      let result;
      if (type === 'plan' && planId) {
        result = await apiPost('plan_purchase.php', {
          uid: me.id,
          plan_id: planId,
          trans_id: paymentMethod.id,
          p_method_id: 2,
          amount,
        });
      } else if (type === 'package' && packageId) {
        result = await apiPost('package_purchase.php', {
          uid: me.id,
          package_id: packageId,
          trans_id: paymentMethod.id,
        });
      }

      if (result?.UserData) {
        localStorage.setItem('Register_User', JSON.stringify(result.UserData));
      }
      router.push('/PaymentRespons?status=success&method=stripe');
    } catch (err) {
      console.error(err);
      setMessage('Erreur réseau Stripe');
    }
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[var(--txt-soft)]">Carte bancaire</label>
        <div className="mt-3 rounded-2xl border border-[var(--line)] bg-white/5 p-4">
          <CardElement options={{ style: { base: { fontSize: '16px', color: '#EDE7EA' } } }} />
        </div>
      </div>
      {message ? <p className="text-sm text-ember">{message}</p> : null}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full rounded-2xl bg-gradient-passion px-5 py-3 text-white shadow-[0_12px_30px_rgba(235,6,3,0.35)] transition hover:brightness-110 disabled:opacity-50"
      >
        {isProcessing ? 'Traitement…' : `Payer ${amount ? `$${amount}` : ''}`}
      </button>
    </form>
  );
}

function StripeContent() {
  const searchParams = useSearchParams();
  const [amount, setAmount] = useState('0.00');
  const router = useRouter();

  const type = searchParams.get('type');
  const planId = searchParams.get('plan_id');
  const packageId = searchParams.get('package_id');

  useEffect(() => {
    const queryAmount = searchParams.get('amount');
    if (queryAmount && Number(queryAmount) > 0) {
      setAmount(Number(queryAmount).toFixed(2));
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-obsidian px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
        <h1 className="font-serif text-3xl text-white">Stripe</h1>
        <p className="mt-3 text-[var(--txt-soft)]">Montant : ${amount}</p>
        <Elements stripe={stripePromise}>
          <StripeForm amount={amount} type={type} planId={planId} packageId={packageId} />
        </Elements>
        <button
          type="button"
          onClick={() => router.push('/payment')}
          className="mt-6 rounded-2xl border border-[var(--line)] px-5 py-3 text-white transition hover:border-ember/40 hover:bg-ember/10"
        >
          Retour à la page de paiement
        </button>
      </div>
    </main>
  );
}

export default function StripePage() {
  return (
    <Suspense fallback={null}>
      <StripeContent />
    </Suspense>
  );
}
