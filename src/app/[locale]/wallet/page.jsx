'use client';

import { useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MyContext } from '@/context/MyProvider';
import { FiZap, FiCreditCard, FiArrowUpRight } from 'react-icons/fi';

const TABS = [
  { key: 'coins', label: 'Historique coins', endpoint: 'coin_report.php' },
  { key: 'wallet', label: 'Portefeuille', endpoint: 'wallet_report.php' },
  { key: 'payouts', label: 'Retraits', endpoint: 'payout_list.php' },
];

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-FR');
}

export default function WalletPage() {
  const router = useRouter();
  const { apiPost, getStoredUser } = useContext(MyContext);
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState('coins');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ coin: '', amt: '', r_type: 'Paypal', paypal_id: '', acc_number: '', bank_name: '', acc_name: '' });
  const [withdrawMsg, setWithdrawMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  if (!me) return null;

  const inputClass = "w-full rounded-xl border border-[var(--line)] bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-ember";

  return (
    <main className="min-h-screen bg-obsidian px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6 animate-rise">
        <section className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8 transition-transform duration-300 hover:-translate-y-1">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--txt-faint)]">Solde Coins</p>
            <p className="mt-3 flex items-center gap-2 font-serif text-4xl text-white">
              <FiZap className="h-7 w-7 text-ember" /> {me.coin ?? 0}
            </p>
          </div>
          <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8 transition-transform duration-300 hover:-translate-y-1">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--txt-faint)]">Portefeuille</p>
            <p className="mt-3 flex items-center gap-2 font-serif text-4xl text-white">
              <FiCreditCard className="h-7 w-7 text-blush" /> {me.wallet ?? 0} €
            </p>
          </div>
        </section>

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

          <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--line)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-left text-[var(--txt-faint)]">
                  <th className="px-4 py-3 font-medium">
                    {tab === 'payouts' ? 'Type' : 'Message'}
                  </th>
                  <th className="px-4 py-3 font-medium">Montant</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="py-10 text-center text-[var(--txt-faint)]">Chargement…</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={4} className="py-10 text-center text-[var(--txt-faint)]">Aucune donnée pour le moment.</td></tr>
                ) : rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--line)] hover:bg-white/[0.03]">
                    <td className="px-4 py-3 text-white">{tab === 'payouts' ? row.r_type : row.message}</td>
                    <td className="px-4 py-3 text-ember">{tab === 'payouts' ? `${row.coin} coins` : `${row.amt} ${tab === 'coins' ? 'coins' : '€'}`}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        row.status === 'Credit' || row.status === 'Approved'
                          ? 'bg-emerald-900/50 text-emerald-400'
                          : row.status === 'Rejected'
                          ? 'bg-ember/10 text-ember'
                          : 'bg-white/5 text-[var(--txt-faint)]'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--txt-faint)]">{formatDate(row.tdate || row.r_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
