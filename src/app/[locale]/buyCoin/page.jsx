'use client';

import { useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MyContext } from '@/context/MyProvider';
import { FiZap } from 'react-icons/fi';

export default function BuyCoinPage() {
  const router = useRouter();
  const { apiPost, getStoredUser } = useContext(MyContext);
  const [me, setMe] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    const stored = getStoredUser();
    if (!token || !stored) {
      router.replace('/login');
      return;
    }
    setMe(stored);
  }, [router, getStoredUser]);

  const loadPackages = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiPost('list_package.php', {});
      if (result.Result === 'true') {
        const seen = new Set();
        const unique = (result.data || []).filter((p) => {
          const key = `${p.coin}-${p.amt}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setPackages(unique);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [apiPost]);

  useEffect(() => { loadPackages(); }, [loadPackages]);

  const startCheckout = (pkg, method) => {
    const params = new URLSearchParams({
      amount: pkg.amt,
      type: 'package',
      package_id: pkg.id,
    });
    router.push(`/${method}?${params.toString()}`);
  };

  if (!me || loading) {
    return (
      <main className="min-h-screen bg-obsidian px-4 py-10">
        <div className="mx-auto max-w-4xl rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8 text-[var(--txt-soft)]">
          Chargement…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-obsidian px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8 text-center">
          <span className="font-mono text-xs uppercase tracking-[0.32em] text-ember">Coins</span>
          <h1 className="mt-2 font-serif text-3xl text-white">Acheter des coins</h1>
          <p className="mt-3 flex items-center justify-center gap-2 font-mono text-2xl text-ember">
            <FiZap className="h-6 w-6" /> {me.coin ?? 0} coins
          </p>
          <p className="mt-1 text-sm text-[var(--txt-soft)]">Solde actuel</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className="flex flex-col items-center rounded-3xl border border-[var(--line)] bg-white/[0.03] p-6 text-center">
              <FiZap className="h-8 w-8 text-ember" />
              <p className="mt-3 font-serif text-2xl text-white">{pkg.coin}</p>
              <p className="text-xs text-[var(--txt-faint)]">coins</p>
              <p className="mt-3 font-mono text-lg text-white">{pkg.amt} €</p>

              <div className="mt-5 flex w-full flex-col gap-2">
                <button
                  onClick={() => startCheckout(pkg, 'paypal')}
                  className="rounded-xl bg-gradient-passion px-4 py-2.5 text-xs font-semibold text-white shadow-[0_6px_18px_rgba(235,6,3,0.35)] transition hover:brightness-110"
                >
                  PayPal
                </button>
                <button
                  onClick={() => startCheckout(pkg, 'stripe')}
                  className="rounded-xl border border-[var(--line)] px-4 py-2.5 text-xs font-semibold text-white transition hover:border-ember/40"
                >
                  Carte bancaire
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
