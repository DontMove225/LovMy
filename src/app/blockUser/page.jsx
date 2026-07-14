'use client';

import { useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MyContext } from '@/context/MyProvider';
import { FiSlash, FiUserX } from 'react-icons/fi';

export default function BlockUserPage() {
  const router = useRouter();
  const { apiPost, imageBaseURL, getStoredUser } = useContext(MyContext);
  const [me, setMe] = useState(null);
  const [blocked, setBlocked] = useState([]);
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
      const result = await apiPost('blocklist.php', { uid });
      setBlocked(result.Result === 'true' ? (result.data || []) : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [apiPost]);

  useEffect(() => { if (me) load(me.id); }, [me, load]);

  const handleUnblock = async (profileId) => {
    if (!me) return;
    try {
      await apiPost('unblock.php', { uid: me.id, profile_id: profileId });
      setBlocked((prev) => prev.filter((b) => b.profile?.id !== profileId));
    } catch (error) {
      console.error(error);
    }
  };

  if (!me) return null;

  return (
    <main className="min-h-screen bg-obsidian px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
          <span className="font-mono text-xs uppercase tracking-[0.32em] text-ember">Sécurité</span>
          <h1 className="mt-2 font-serif text-3xl text-white">Utilisateurs bloqués</h1>
          <p className="mt-2 text-[var(--txt-soft)]">Gère les blocs et déblocages d&apos;utilisateurs.</p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8 text-center text-[var(--txt-soft)]">
            Chargement…
          </div>
        ) : blocked.length === 0 ? (
          <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-10 text-center text-[var(--txt-soft)]">
            <FiUserX className="mx-auto h-8 w-8 text-[var(--txt-faint)]" />
            <p className="mt-3">Aucun utilisateur bloqué.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {blocked.map((b) => (
              <div key={b.id} className="flex items-center gap-4 rounded-2xl border border-[var(--line)] bg-white/[0.03] p-4">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-passion text-sm font-bold text-white">
                  {b.profile?.profile_pic ? (
                    <Image
                      src={`${imageBaseURL}${b.profile.profile_pic}`}
                      alt={b.profile.name}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  ) : (
                    b.profile?.name?.[0]?.toUpperCase() ?? '?'
                  )}
                </div>
                <p className="flex-1 font-medium text-white">{b.profile?.name ?? 'Utilisateur'}</p>
                <button
                  onClick={() => handleUnblock(b.profile?.id)}
                  className="flex items-center gap-1.5 rounded-full border border-[var(--line)] px-4 py-2 text-xs text-[var(--txt-soft)] transition hover:border-ember/40 hover:text-ember"
                >
                  <FiSlash className="h-3.5 w-3.5" /> Débloquer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
