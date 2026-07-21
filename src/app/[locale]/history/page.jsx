'use client';

import { useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MyContext } from '@/context/MyProvider';
import { FiClock, FiStar } from 'react-icons/fi';
import HeartbeatLoader from '@/components/ui/HeartbeatLoader';

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
  const [history, setHistory] = useState([]);
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

  const load = useCallback(async (uid) => {
    setLoading(true);
    try {
      const result = await apiPost('plan_history.php', { uid });
      setHistory(result.Result === 'true' ? (result.data || []) : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [apiPost]);

  useEffect(() => { if (me) load(me.id); }, [me, load]);

  if (!me) return null;

  return (
    <main className="min-h-screen bg-obsidian px-4 py-10">
      <div className="mx-auto max-w-3xl animate-rise">
        <div className="mb-6 rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
          <span className="font-mono text-xs uppercase tracking-[0.32em] text-ember">Historique</span>
          <h1 className="mt-2 font-serif text-3xl text-white">Historique des abonnements</h1>
          <p className="mt-2 text-[var(--txt-soft)]">Retrouve tous tes achats de plans Premium.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-[var(--line)] bg-white/[0.03] p-14 text-center text-[var(--txt-soft)]">
            <HeartbeatLoader size={48} />
            Chargement…
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-10 text-center text-[var(--txt-soft)]">
            <FiClock className="mx-auto h-8 w-8 text-[var(--txt-faint)]" />
            <p className="mt-3">Aucun achat pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((h) => (
              <div key={h.id} className="flex items-center gap-4 rounded-2xl border border-[var(--line)] bg-white/[0.03] p-5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-passion">
                  <FiStar className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-lg text-white">{h.plan_title}</p>
                  <p className="text-xs text-[var(--txt-faint)]">
                    Du {formatDate(h.start_date)} au {formatDate(h.expire_date)} · {h.day} jours
                  </p>
                </div>
                <p className="shrink-0 font-mono text-lg text-ember">{h.amount} €</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
