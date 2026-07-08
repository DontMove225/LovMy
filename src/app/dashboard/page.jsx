'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MyContext } from '@/context/MyProvider';

export default function DashboardPage() {
  const { imageBaseURL, apiPost } = useContext(MyContext);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('Register_User');

    if (!token || !userData) {
      router.replace('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchHomeData();
  }, [router]);

  const fetchHomeData = async () => {
    const userData = JSON.parse(localStorage.getItem('Register_User') || '{}');
    try {
      const result = await apiPost('home_data.php', {
        uid: userData.id,
        lats: 0,
        longs: 0,
      });

      if (result.Result === 'true') {
        setProfiles(result.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-obsidian px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.32em] text-ember">Dashboard</p>
              <h1 className="mt-2 font-serif text-4xl text-white">Bienvenue, {user.name || 'utilisateur'}.</h1>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                router.push('/login');
              }}
              className="rounded-2xl border border-[var(--line)] px-5 py-3 text-white transition hover:border-ember/40 hover:bg-ember/10"
            >
              Déconnexion
            </button>
          </div>
          <p className="mt-4 text-[var(--txt-soft)]">Voici les profils recommandés par le backend.</p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8 text-[var(--txt-soft)]">Chargement...</div>
          ) : profiles.length === 0 ? (
            <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8 text-[var(--txt-soft)]">Aucun profil disponible pour le moment.</div>
          ) : (
            profiles.map((profile) => (
              <article key={profile.id} className="overflow-hidden rounded-3xl border border-[var(--line)] bg-white/[0.03]">
                <div className="h-60 w-full overflow-hidden bg-steel/20">
                  {profile.profile_pic ? (
                    <img
                      src={`${imageBaseURL}${profile.profile_pic}`}
                      alt={profile.name || 'Profil'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-steel/20 text-[var(--txt-faint)]">
                      Image non disponible
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="font-serif text-xl text-white">{profile.name || 'Profil'}</h2>
                  <p className="mt-2 text-sm text-[var(--txt-soft)]">{profile.bio || 'Aucune description'}</p>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
