'use client';

import { Suspense, useContext, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MyContext } from '@/context/MyProvider';

function PaypalContent() {
  const { apiPost, getStoredUser } = useContext(MyContext);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [amount, setAmount] = useState('0.00');
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState('');

  const type = searchParams.get('type');
  const planId = searchParams.get('plan_id');
  const packageId = searchParams.get('package_id');

  useEffect(() => {
    const queryAmount = searchParams.get('amount');
    if (queryAmount && Number(queryAmount) > 0) {
      setAmount(Number(queryAmount).toFixed(2));
    }
  }, [searchParams]);

  const finalizePurchase = async (transId) => {
    const me = getStoredUser();
    if (!me) return;

    if (type === 'plan' && planId) {
      const result = await apiPost('plan_purchase.php', {
        uid: me.id,
        plan_id: planId,
        trans_id: transId,
        p_method_id: 1,
        amount,
      });
      if (result.UserData) localStorage.setItem('Register_User', JSON.stringify(result.UserData));
    } else if (type === 'package' && packageId) {
      const result = await apiPost('package_purchase.php', {
        uid: me.id,
        package_id: packageId,
        trans_id: transId,
      });
      if (result.UserData) localStorage.setItem('Register_User', JSON.stringify(result.UserData));
    }
  };

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
        try {
          await finalizePurchase(details.id);
        } catch (err) {
          console.error(err);
        }
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
    <main className="min-h-screen bg-obsidian px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
        <h1 className="font-serif text-3xl text-white">PayPal</h1>
        <p className="mt-3 text-[var(--txt-soft)]">Montant : ${amount}</p>
        {message ? <p className="mt-4 text-sm text-ember">{message}</p> : null}
        <div className="mt-8" id="paypal-button-container"></div>
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

export default function PaypalPage() {
  return (
    <Suspense fallback={null}>
      <PaypalContent />
    </Suspense>
  );
}
