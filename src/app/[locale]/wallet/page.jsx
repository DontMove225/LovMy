'use client';

import { Suspense, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MyContext } from '@/context/MyProvider';
import { FiZap, FiArrowUp, FiArrowUpRight, FiArrowDownLeft, FiClock } from 'react-icons/fi';
import PaymentMethodModal from '@/components/ui/PaymentMethodModal';
import { PAYMENT_METHODS } from '@/lib/paymentMethods';

const TABS = [
  { key: 'coins', label: 'Coins', endpoint: 'coin_report.php' },
  { key: 'wallet', label: 'Portefeuille', endpoint: 'wallet_report.php' },
  { key: 'payouts', label: 'Retraits', endpoint: 'payout_list.php' },
];

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-FR');
}

function WalletContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { apiPost, getStoredUser } = useContext(MyContext);
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState('coins');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ coin: '', amt: '', r_type: 'Paypal', paypal_id: '', acc_number: '', bank_name: '', acc_name: '' });
  const [withdrawMsg, setWithdrawMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpMethod, setTopUpMethod] = useState(null);

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

  const fetchTab = useCallback(async (key, uid) => {
    setLoading(true);
    const { endpoint } = TABS.find((t) => t.key === key);
    try {
      const result = await apiPost(endpoint, { uid });
      setRows(result.Result === 'true' ? (result.data || []) : []);
    } catch (error) {
      console.error(error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [apiPost]);

  useEffect(() => {
    if (me) fetchTab(tab, me.id);
  }, [me, tab, fetchTab]);

  useEffect(() => {
    if (searchParams.get('withdraw') === '1') setShowWithdraw(true);
  }, [searchParams]);

  const handleWithdraw = async (event) => {
    event.preventDefault();
    if (!me) return;
    setSubmitting(true);
    setWithdrawMsg('');
    try {
      const result = await apiPost('request_withdraw.php', {
        uid: me.id,
        amt: withdrawForm.amt,
        coin: withdrawForm.coin,
        r_type: withdrawForm.r_type,
        paypal_id: withdrawForm.r_type === 'Paypal' ? withdrawForm.paypal_id : undefined,
        acc_number: withdrawForm.r_type === 'BANK Transfer' ? withdrawForm.acc_number : undefined,
        bank_name: withdrawForm.r_type === 'BANK Transfer' ? withdrawForm.bank_name : undefined,
        acc_name: withdrawForm.r_type === 'BANK Transfer' ? withdrawForm.acc_name : undefined,
      });
      if (result.Result === 'true') {
        setWithdrawMsg('Demande de retrait envoyée !');
        setShowWithdraw(false);
        setWithdrawForm({ coin: '', amt: '', r_type: 'Paypal', paypal_id: '', acc_number: '', bank_name: '', acc_name: '' });
        if (tab === 'payouts') fetchTab('payouts', me.id);
      } else {
        setWithdrawMsg(result.ResponseMsg || 'Erreur lors de la demande.');
      }
    } catch (error) {
      console.error(error);
      setWithdrawMsg('Erreur réseau, réessayez plus tard.');
    } finally {
      setSubmitting(false);
    }
  };

  const openTopUp = () => {
    setTopUpAmount('');
    setTopUpMethod(null);
    setTopUpOpen(true);
  };

  const confirmTopUp = () => {
    const amt = Number(topUpAmount);
    if (!(amt > 0) || !topUpMethod) return;
    const params = new URLSearchParams({ amount: amt.toFixed(2), type: 'wallet' });
    router.push(`/${topUpMethod}?${params.toString()}`);
  };

  if (!me) return null;

  const inputClass = "w-full rounded-xl border border-[var(--line)] bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-ember";

  return (
    <main className="min-h-screen bg-obsidian px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6 animate-rise">
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.32em] text-ember">Solde total</span>
            <p className="mt-2 font-serif text-4xl text-white">{Number(me.wallet ?? 0).toFixed(2)} €</p>
            <button
              onClick={() => router.push('/buyCoin')}
              className="mt-2 flex items-center gap-1.5 text-xs text-[var(--txt-soft)] transition hover:text-white"
            >
              <FiZap className="h-3.5 w-3.5 text-ember" /> {me.coin ?? 0} coins · Acheter des coins
            </button>
          </div>
          <button
            onClick={openTopUp}
            className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-gradient-passion px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_34px_-10px_rgba(246,65,53,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-12px_rgba(235,6,3,0.45)]"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <FiArrowUp className="relative h-4 w-4" />
            <span className="relative">Top-up</span>
          </button>
        </div>

        <section className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    tab === t.key
                      ? 'bg-gradient-passion text-white shadow-[0_6px_18px_rgba(235,6,3,0.35)]'
                      : 'border border-[var(--line)] text-[var(--txt-soft)] hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowWithdraw((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--txt-soft)] transition hover:border-ember/40 hover:text-white"
            >
              <FiArrowUpRight className="h-4 w-4" /> Demander un retrait
            </button>
          </div>

          {withdrawMsg ? (
            <p className="mt-4 rounded-xl border border-ember/30 bg-ember/10 px-4 py-2.5 text-sm text-white">{withdrawMsg}</p>
          ) : null}

          {showWithdraw ? (
            <form onSubmit={handleWithdraw} className="mt-5 space-y-4 rounded-2xl border border-[var(--line)] bg-white/[0.02] p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-[var(--txt-faint)]">Coins à retirer</label>
                  <input type="number" required value={withdrawForm.coin} onChange={(e) => setWithdrawForm((f) => ({ ...f, coin: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[var(--txt-faint)]">Montant (€)</label>
                  <input type="number" required value={withdrawForm.amt} onChange={(e) => setWithdrawForm((f) => ({ ...f, amt: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[var(--txt-faint)]">Méthode</label>
                  <select value={withdrawForm.r_type} onChange={(e) => setWithdrawForm((f) => ({ ...f, r_type: e.target.value }))} className={inputClass}>
                    <option value="Paypal">PayPal</option>
                    <option value="BANK Transfer">Virement bancaire</option>
                  </select>
                </div>
                {withdrawForm.r_type === 'Paypal' ? (
                  <div>
                    <label className="mb-1 block text-xs text-[var(--txt-faint)]">Email PayPal</label>
                    <input value={withdrawForm.paypal_id} onChange={(e) => setWithdrawForm((f) => ({ ...f, paypal_id: e.target.value }))} className={inputClass} />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="mb-1 block text-xs text-[var(--txt-faint)]">Nom du titulaire</label>
                      <input value={withdrawForm.acc_name} onChange={(e) => setWithdrawForm((f) => ({ ...f, acc_name: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-[var(--txt-faint)]">Banque</label>
                      <input value={withdrawForm.bank_name} onChange={(e) => setWithdrawForm((f) => ({ ...f, bank_name: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-[var(--txt-faint)]">IBAN / N° de compte</label>
                      <input value={withdrawForm.acc_number} onChange={(e) => setWithdrawForm((f) => ({ ...f, acc_number: e.target.value }))} className={inputClass} />
                    </div>
                  </>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-gradient-passion px-5 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(235,6,3,0.35)] transition hover:brightness-110 disabled:opacity-60"
              >
                {submitting ? 'Envoi…' : 'Envoyer la demande'}
              </button>
            </form>
          ) : null}

          <p className="mb-3 mt-7 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--txt-faint)]">Transactions</p>

          {loading ? (
            <p className="py-10 text-center text-sm text-[var(--txt-faint)]">Chargement…</p>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-[var(--txt-faint)]">
              <FiClock className="h-7 w-7" />
              <p className="text-sm">Aucune transaction pour le moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--line)]">
              {rows.map((row) => {
                if (tab === 'payouts') {
                  const badgeClass =
                    row.status === 'Approved'
                      ? 'bg-emerald-900/50 text-emerald-400'
                      : row.status === 'Rejected'
                      ? 'bg-ember/10 text-ember'
                      : 'bg-white/5 text-[var(--txt-faint)]';
                  return (
                    <div key={row.id} className="flex items-center gap-4 py-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[rgba(232,158,161,0.12)]">
                        <FiArrowUpRight className="h-4 w-4 text-blush" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">Retrait — {row.r_type}</p>
                        <p className="text-xs text-[var(--txt-faint)]">{formatDate(row.r_date)}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass}`}>{row.status}</span>
                    </div>
                  );
                }

                const isCredit = row.status === 'Credit';
                const unit = tab === 'coins' ? 'coins' : '€';
                return (
                  <div key={row.id} className="flex items-center gap-4 py-4">
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${
                        isCredit ? 'bg-emerald-900/40' : 'bg-ember/10'
                      }`}
                    >
                      {isCredit ? (
                        <FiArrowDownLeft className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <FiArrowUpRight className="h-4 w-4 text-ember" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{row.message}</p>
                      <p className="text-xs text-[var(--txt-faint)]">{isCredit ? 'Crédit' : 'Débit'} · {formatDate(row.tdate)}</p>
                    </div>
                    <p className={`shrink-0 font-mono text-sm font-semibold ${isCredit ? 'text-emerald-400' : 'text-ember'}`}>
                      {isCredit ? '+' : '-'}{row.amt} {unit}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <PaymentMethodModal
        open={topUpOpen}
        title="Ajouter au portefeuille"
        amountInput
        amountValue={topUpAmount}
        onAmountChange={setTopUpAmount}
        methods={PAYMENT_METHODS}
        selected={topUpMethod}
        onSelect={setTopUpMethod}
        onContinue={confirmTopUp}
        onClose={() => setTopUpOpen(false)}
      />
    </main>
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={null}>
      <WalletContent />
    </Suspense>
  );
}
