'use client';

import { useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MyContext } from '@/context/MyProvider';
import { FiArrowLeft, FiArrowDownLeft, FiArrowUpRight, FiClock } from 'react-icons/fi';
import HeartbeatLoader from '@/components/ui/HeartbeatLoader';

const TABS = [
  { key: 'coins', label: 'Historique des coins', endpoint: 'coin_report.php' },
  { key: 'payouts', label: 'Historique des retraits', endpoint: 'payout_list.php' },
];

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-FR');
}

export default function HistoryPage() {
  const router = useRouter();
  const { apiPost, getStoredUser } = useContext(MyContext);
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState('coins');
  const [rows, setRows] = useState([]);
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

  const load = useCallback(async (key, uid) => {
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

  useEffect(() => { if (me) load(tab, me.id); }, [me, tab, load]);

  if (!me) return null;

  return (
    <main className="min-h-screen bg-obsidian px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6 animate-rise">
        <div className="flex items-center gap-3 rounded-3xl border border-[var(--line)] bg-white/[0.03] p-6">
          <button
            onClick={() => router.back()}
            className="rounded-full p-2 text-[var(--txt-soft)] transition hover:bg-white/5 hover:text-white"
            aria-label="Retour"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-serif text-2xl text-white">Historique</h1>
        </div>

        <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-6">
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
        </div>

        <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-6">
          {loading ? (
            <div className="flex flex-col items-center gap-4 py-14 text-[var(--txt-soft)]">
              <HeartbeatLoader size={48} />
              Chargement…
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-center text-[var(--txt-faint)]">
              <FiClock className="h-8 w-8" />
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
                        <p className="text-xs text-[var(--txt-faint)]">{row.coin} coins · {formatDate(row.r_date)}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass}`}>{row.status}</span>
                    </div>
                  );
                }

                const isCredit = row.status === 'Credit';
                return (
                  <div key={row.id} className="flex items-center gap-4 py-4">
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${isCredit ? 'bg-emerald-900/40' : 'bg-ember/10'}`}>
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
                      {isCredit ? '+' : '-'}{row.amt} coins
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
