'use client';

import { useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MyContext } from '@/context/MyProvider';
import { FiBell } from 'react-icons/fi';
import HeartbeatLoader from '@/components/ui/HeartbeatLoader';

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function NotificationPage() {
  const router = useRouter();
  const { apiPost, getStoredUser, clearUnreadCount } = useContext(MyContext);
  const [me, setMe] = useState(null);
  const [notifications, setNotifications] = useState([]);
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
      const result = await apiPost('u_notification_list.php', { uid });
      setNotifications(result.Result === 'true' ? (result.data || []) : []);
      await apiPost('notifications/mark-read');
      clearUnreadCount();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [apiPost, clearUnreadCount]);

  useEffect(() => { if (me) load(me.id); }, [me, load]);

  if (!me) return null;

  return (
    <main className="min-h-screen bg-obsidian px-4 py-10">
      <div className="mx-auto max-w-3xl animate-rise">
        <div className="mb-6 rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
          <span className="font-mono text-xs uppercase tracking-[0.32em] text-ember">Notifications</span>
          <h1 className="mt-2 font-serif text-3xl text-white">Vos notifications</h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-[var(--line)] bg-white/[0.03] p-14 text-center text-[var(--txt-soft)]">
            <HeartbeatLoader size={48} />
            Chargement…
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-10 text-center text-[var(--txt-soft)]">
            <FiBell className="mx-auto h-8 w-8 text-[var(--txt-faint)]" />
            <p className="mt-3">Aucune notification pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`relative flex gap-4 rounded-2xl border p-5 transition ${
                  n.is_read
                    ? 'border-[var(--line)] bg-white/[0.03]'
                    : 'border-ember/30 bg-ember/[0.06]'
                }`}
              >
                {!n.is_read && (
                  <span className="absolute right-4 top-5 h-2 w-2 rounded-full bg-ember shadow-[0_0_8px_rgba(246,65,53,0.7)]" />
                )}
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-passion">
                  <FiBell className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-serif text-lg text-white">{n.title}</p>
                    <span className="shrink-0 font-mono text-[10px] text-[var(--txt-faint)]">{formatDate(n.datetime)}</span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--txt-soft)]">{n.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
