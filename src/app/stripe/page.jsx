'use client';

import { Suspense, useContext, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { MyContext } from '@/context/MyProvider';

function StripeForm({ type, planId, packageId }) {
  const { apiPost } = useContext(MyContext);
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
    setMessage('');

    try {
      const intentResult = await apiPost('stripe/create-intent', {
        type,
        plan_id: type === 'plan' ? planId : undefined,
        package_id: type === 'package' ? packageId : undefined,
      });

      if (intentResult.Result !== 'true') {
        setMessage(intentResult.ResponseMsg || 'Impossible de démarrer le paiement.');
        setIsProcessing(false);
        return;
      }

      const { client_secret: clientSecret } = intentResult.data;

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

      if (error) {
        setMessage(error.message || 'Erreur Stripe');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent.status !== 'succeeded') {
        setMessage('Le paiement n\'a pas pu être confirmé.');
        setIsProcessing(false);
        return;
      }

      const confirmResult = await apiPost('stripe/confirm', {
        payment_intent_id: paymentIntent.id,
      });

      if (confirmResult.Result !== 'true') {
        setMessage(confirmResult.ResponseMsg || 'Le paiement a réussi mais la confirmation a échoué. Contactez le support.');
        setIsProcessing(false);
        return;
      }

      if (confirmResult.UserData) {
        localStorage.setItem('Register_User', JSON.stringify(confirmResult.UserData));
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
        {isProcessing ? 'Traitement…' : 'Payer'}
      </button>
    </form>
  );
}

function StripeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { apiPost } = useContext(MyContext);
  const [stripePromise, setStripePromise] = useState(null);
  const [amount, setAmount] = useState('0.00');

  const type = searchParams.get('type');
  const planId = searchParams.get('plan_id');
  const packageId = searchParams.get('package_id');

  useEffect(() => {
    const queryAmount = searchParams.get('amount');
    if (queryAmount && Number(queryAmount) > 0) {
      setAmount(Number(queryAmount).toFixed(2));
    }
  }, [searchParams]);

  useEffect(() => {
    (async () => {
      try {
        const result = await apiPost('setting.php', {});
        const publishableKey = result.data?.stripe_key;
        if (publishableKey) {
          setStripePromise(loadStripe(publishableKey));
        }
      } catch (error) {
        console.error(error);
      }
    })();
  }, [apiPost]);

  return (
    <main className="min-h-screen bg-obsidian px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
        <h1 className="font-serif text-3xl text-white">Stripe</h1>
        <p className="mt-3 text-[var(--txt-soft)]">Montant estimé : ${amount}</p>
        {stripePromise ? (
          <Elements stripe={stripePromise}>
            <StripeForm type={type} planId={planId} packageId={packageId} />
          </Elements>
        ) : (
          <p className="mt-6 text-sm text-[var(--txt-soft)]">Chargement du module de paiement…</p>
        )}
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
