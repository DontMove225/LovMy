'use client';

import { useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MyContext } from '@/context/MyProvider';
import { FiCheck, FiX, FiStar } from 'react-icons/fi';
import PremiumBadge from '@/components/ui/PremiumBadge';
import HeartbeatLoader from '@/components/ui/HeartbeatLoader';

export default function UpgradePage() {
  const router = useRouter();
  const { apiPost, getStoredUser } = useContext(MyContext);
  const [me, setMe] = useState(null);
  const [plans, setPlans] = useState([]);
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

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiPost('plan.php', {});
      if (result.Result === 'true') {
        const seen = new Set();
        const unique = (result.data || []).filter((p) => {
          if (seen.has(p.title)) return false;
          seen.add(p.title);
          return true;
        });
        setPlans(unique);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [apiPost]);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  const startCheckout = (plan, method) => {
    const params = new URLSearchParams({
      amount: plan.amt,
      type: 'plan',
      plan_id: plan.id,
    });
    router.push(`/${method}?${params.toString()}`);
  };

  if (!me || loading) {
    return (
      <main className="min-h-screen bg-obsidian px-4 py-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 rounded-3xl border border-[var(--line)] bg-white/[0.03] p-14 text-[var(--txt-soft)]">
          <HeartbeatLoader size={56} />
          Chargement…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-obsidian px-4 py-10">
      <div className="mx-auto max-w-5xl animate-rise">
        <div className="mb-8 text-center">
          <PremiumBadge />
          <h1 className="mt-3 font-serif text-4xl text-white">Passez à la vitesse supérieure</h1>
          <p className="mt-3 text-[var(--txt-soft)]">Choisissez le plan qui vous correspond.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = me.plan_id === plan.id || (me.plan_id === 0 && plan.amt == 0);
            const isFree = Number(plan.amt) === 0;
            const isFeatured = plan.title === 'Premium';

            const features = [
              { label: 'Swipe & découverte de profils', on: true },
              { label: 'Filtres de recherche avancés', on: !!plan.filter_include },
              { label: 'Chat direct illimité', on: !!plan.direct_chat },
              { label: 'Appels audio & vidéo', on: !!plan.audio_video },
            ];

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-3xl border p-7 transition-transform duration-300 hover:-translate-y-1 ${
                  isFeatured ? 'border-ember bg-gradient-to-b from-[#2a0f14] to-white/[0.03] shadow-[0_24px_70px_-24px_rgba(68,0,4,0.7)]' : 'border-[var(--line)] bg-white/[0.03]'
                }`}
              >
                {isFeatured ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-passion px-4 py-1 font-mono text-[10px] uppercase tracking-wide text-white shadow-[0_6px_18px_rgba(235,6,3,0.35)]">
                    Meilleure offre
                  </span>
                ) : null}

                <h2 className="font-serif text-2xl text-white">{plan.title}</h2>
                <p className="mt-3">
                  <span className="font-serif text-4xl text-white">{isFree ? 'Gratuit' : `${plan.amt} €`}</span>
                  {!isFree ? <span className="text-sm text-[var(--txt-faint)]"> / {plan.day_limit} jours</span> : null}
                </p>
                <p className="mt-3 text-sm text-[var(--txt-soft)]">{plan.description}</p>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {features.map((f) => (
                    <li key={f.label} className="flex items-center gap-2.5 text-sm">
                      {f.on ? (
                        <FiCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                      ) : (
                        <FiX className="h-4 w-4 shrink-0 text-[var(--txt-faint)]" />
                      )}
                      <span className={f.on ? 'text-white' : 'text-[var(--txt-faint)] line-through'}>{f.label}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <span className="mt-6 rounded-2xl border border-[var(--line)] px-5 py-3 text-center text-sm font-semibold text-[var(--txt-soft)]">
                    Plan actuel
                  </span>
                ) : isFree ? (
                  <span className="mt-6 rounded-2xl border border-[var(--line)] px-5 py-3 text-center text-sm text-[var(--txt-faint)]">
                    Plan de base
                  </span>
                ) : (
                  <div className="mt-6 flex flex-col gap-2">
                    <button
                      onClick={() => startCheckout(plan, 'paypal')}
                      className="group relative overflow-hidden rounded-2xl bg-gradient-passion px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_34px_-10px_rgba(246,65,53,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-12px_rgba(235,6,3,0.45)]"
                    >
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                      <span className="relative">Choisir — PayPal</span>
                    </button>
                    <button
                      onClick={() => startCheckout(plan, 'stripe')}
                      className="rounded-2xl border border-[var(--line)] px-5 py-3 text-sm font-semibold text-white transition hover:border-ember/40"
                    >
                      Choisir — Carte bancaire
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {me.is_subscribe ? (
          <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl border border-ember/30 bg-ember/10 px-5 py-3 text-center text-sm text-white">
            <FiStar className="h-4 w-4 text-ember" />
            Abonnement actif jusqu&apos;au {me.plan_end_date ? new Date(me.plan_end_date).toLocaleDateString('fr-FR') : '—'}
          </div>
        ) : null}
      </div>
    </main>
  );
}
