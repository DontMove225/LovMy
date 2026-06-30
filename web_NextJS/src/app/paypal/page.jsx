'use client';

import { useContext, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MyContext } from '@/context/MyProvider';

export default function PaypalPage() {
  const { basUrl } = useContext(MyContext);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [amount, setAmount] = useState('0.00');
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const queryAmount = searchParams.get('amount');
    if (queryAmount && Number(queryAmount) > 0) {
      setAmount(Number(queryAmount).toFixed(2));
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (loaded || window.paypal) {
      setLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=Aa0Yim_XLAz89S4cqO-kT4pK3QbFsruHvEm8zDYX_Y-wIKgsGyv4TzL84dGgtWYUoJqTvKUh0JonIaKa&currency=USD';
    script.async = true;
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [loaded]);

  useEffect(() => {
    if (!loaded || typeof window === 'undefined') return;
    if (!window.paypal) return;

    window.paypal.Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{ amount: { value: amount } }],
        });
      },
      onApprove: async (data, actions) => {
        const details = await actions.order.capture();
        localStorage.setItem('paymentStatus', 'success');
        localStorage.setItem('paymentMethod', 'PayPal');
        localStorage.setItem('paymentDetails', JSON.stringify(details));
        router.push('/PaymentRespons?status=success&method=paypal');
      },
      onCancel: () => {
        router.push('/PaymentRespons?status=cancel&method=paypal');
      },
      onError: (err) => {
        console.error(err);
        setMessage('Erreur PayPal, réessayez.');
      },
    }).render('#paypal-button-container');
  }, [loaded, amount, router]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-slate-900">PayPal</h1>
        <p className="mt-3 text-slate-600">Montant : ${amount}</p>
        {message ? <p className="mt-4 text-sm text-rose-600">{message}</p> : null}
        <div className="mt-8" id="paypal-button-container"></div>
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
