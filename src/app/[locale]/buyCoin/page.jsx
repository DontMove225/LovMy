'use client';

import { useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MyContext } from '@/context/MyProvider';
import { FiZap, FiArrowUp, FiArrowDown, FiClock, FiCheck } from 'react-icons/fi';
import HeartbeatLoader from '@/components/ui/HeartbeatLoader';
import PaymentMethodModal from '@/components/ui/PaymentMethodModal';
import { PAYMENT_METHODS } from '@/lib/paymentMethods';

const INFO_ITEMS = [
  "Les coins peuvent être utilisés uniquement pour envoyer des cadeaux.",
  "Les coins n'ont aucune date d'expiration.",
  "Les coins peuvent être achetés avec tous les moyens de paiement disponibles.",
  "Les coins sont crédités uniquement sur votre solde de coins.",
  "Les coins peuvent être retirés uniquement via la méthode décrite dans votre Portefeuille.",
  "Les coins ne peuvent pas être transférés à un autre utilisateur.",
  "Un minimum de 1000 coins est requis pour effectuer un retrait.",
];

export default function BuyCoinPage() {
  const router = useRouter();
  const { apiPost, getStoredUser } = useContext(MyContext);
  const [me, setMe] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

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
        setSelectedPkg((cur) => cur ?? unique[0]?.id ?? null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [apiPost]);

  useEffect(() => { loadPackages(); }, [loadPackages]);

  const currentPkg = packages.find((p) => p.id === selectedPkg) || null;

  const openTopUp = () => {
    if (!currentPkg) return;
    setSelectedMethod(null);
    setShowModal(true);
  };

  const confirmCheckout = () => {
    if (!currentPkg || !selectedMethod) return;
    const params = new URLSearchParams({
      amount: currentPkg.amt,
      type: 'package',
      package_id: currentPkg.id,
    });
    router.push(`/${selectedMethod}?${params.toString()}`);
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
      <div className="mx-auto max-w-4xl space-y-6 animate-rise">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.32em] text-ember">Vos coins</span>
            <p className="mt-2 flex items-center gap-2 font-serif text-4xl text-white">
              <FiZap className="h-8 w-8 text-ember" /> {me.coin ?? 0}
            </p>
          </div>
          <button
            onClick={() => router.push('/history')}
            className="flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--txt-soft)] transition hover:border-ember/40 hover:text-white"
          >
            <FiClock className="h-4 w-4" /> Historique
          </button>
        </div>

        <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
          <h2 className="mb-5 font-serif text-xl text-white">Choisir un pack de coins</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {packages.map((pkg) => {
              const active = pkg.id === selectedPkg;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelectedPkg(pkg.id)}
                  className={`relative flex flex-col items-center rounded-2xl border p-5 text-center transition-all duration-300 ${
                    active
                      ? 'border-ember bg-ember/10 shadow-[0_18px_50px_-12px_rgba(235,6,3,0.35)]'
                      : 'border-[var(--line)] hover:-translate-y-1 hover:border-ember/30'
                  }`}
                >
                  {active ? (
                    <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-gradient-passion text-white shadow-[0_6px_18px_rgba(235,6,3,0.35)]">
                      <FiCheck className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                  ) : null}
                  <FiZap className="h-7 w-7 text-ember" />
                  <p className="mt-2 font-serif text-2xl text-white">{pkg.coin}</p>
                  <p className="text-[11px] text-[var(--txt-faint)]">coins</p>
                  <p className="mt-2 font-mono text-base text-white">{pkg.amt} €</p>
                </button>
              );
            })}
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={openTopUp}
              disabled={!currentPkg}
              className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-gradient-passion px-7 py-3 text-sm font-semibold text-white shadow-[0_10px_34px_-10px_rgba(246,65,53,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-12px_rgba(235,6,3,0.45)] disabled:pointer-events-none disabled:opacity-40"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <FiArrowUp className="relative h-4 w-4" />
              <span className="relative">Recharger</span>
            </button>
            <button
              type="button"
              onClick={() => router.push('/wallet?withdraw=1')}
              className="flex items-center gap-2 rounded-full border border-[var(--line)] px-7 py-3 text-sm font-semibold text-white transition hover:border-ember/40 hover:bg-white/5"
            >
              <FiArrowDown className="h-4 w-4" /> Retirer
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
          <h2 className="mb-4 font-serif text-lg text-white">Infos sur l&apos;achat de coins</h2>
          <ul className="space-y-2.5">
            {INFO_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--txt-soft)]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <PaymentMethodModal
        open={showModal}
        amount={currentPkg?.amt}
        methods={PAYMENT_METHODS}
        selected={selectedMethod}
        onSelect={setSelectedMethod}
        onContinue={confirmCheckout}
        onClose={() => setShowModal(false)}
      />
    </main>
  );
}
