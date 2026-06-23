'use client';

import { useContext, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { MyContext } from '@/context/MyProvider';

const stripePromise = loadStripe('pk_test_6pRNASCoBOKtIshFeOQq4XMUh');

function StripeForm({ amount }) {
  const { paymentBaseURL } = useContext(MyContext);
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
      const response = await fetch(`${paymentBaseURL}react_stripe/token.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          payment_method_id: paymentMethod.id,
        }),
      });
      const result = await response.json();
      if (result.Result === 'true') {
        localStorage.setItem('paymentStatus', 'success');
        localStorage.setItem('paymentMethod', 'Stripe');
        localStorage.setItem('paymentDetails', JSON.stringify(result));
        router.push('/PaymentRespons?status=success&method=stripe');
      } else {
        setMessage(result.ResponseMsg || 'Paiement échoué');
      }
    } catch (err) {
      console.error(err);
      setMessage('Erreur réseau Stripe');
    }
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700">Carte bancaire</label>
        <div className="mt-3 rounded-2xl border border-slate-300 bg-slate-50 p-4">
          <CardElement options={{ style: { base: { fontSize: '16px', color: '#0f172a' } } }} />
        </div>
      </div>
      {message ? <p className="text-sm text-rose-600">{message}</p> : null}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full rounded-2xl bg-violet-600 px-5 py-3 text-white hover:bg-violet-700 disabled:opacity-50"
      >
        {isProcessing ? 'Traitement…' : `Payer ${amount ? `$${amount}` : ''}`}
      </button>
    </form>
  );
}

export default function StripePage() {
  const searchParams = useSearchParams();
  const [amount, setAmount] = useState('0.00');
  const router = useRouter();

  useEffect(() => {
    const queryAmount = searchParams.get('amount');
    if (queryAmount && Number(queryAmount) > 0) {
      setAmount(Number(queryAmount).toFixed(2));
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-slate-900">Stripe</h1>
        <p className="mt-3 text-slate-600">Montant : ${amount}</p>
        <Elements stripe={stripePromise}>
          <StripeForm amount={amount} />
        </Elements>
        <button
          type="button"
          onClick={() => router.push('/payment')}
          className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 text-white hover:bg-slate-700"
        >
          Retour à la page de paiement
        </button>
      </div>
    </main>
  );
}
