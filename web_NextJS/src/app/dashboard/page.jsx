'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MyContext } from '@/context/MyProvider';
import axios from 'axios';

export default function DashboardPage() {
  const { basUrl, imageBaseURL } = useContext(MyContext);
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
      const response = await axios.post(`${basUrl}home_data.php`, {
        uid: userData.id,
        lats: 0,
        longs: 0,
      });

      if (response.data.Result === 'true') {
        setProfiles(response.data.data || []);
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
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl bg-white p-8 shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-violet-600">Dashboard</p>
              <h1 className="mt-2 text-4xl font-bold text-slate-900">Bienvenue, {user.name || 'utilisateur'}.</h1>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                router.push('/login');
              }}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-700"
            >
              Déconnexion
            </button>
          </div>
          <p className="mt-4 text-slate-600">Voici les profils recommandés par le backend.</p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="rounded-3xl bg-white p-8 shadow-xl">Chargement...</div>
          ) : profiles.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 shadow-xl">Aucun profil disponible pour le moment.</div>
          ) : (
            profiles.map((profile) => (
              <article key={profile.id} className="overflow-hidden rounded-3xl bg-white shadow-lg">
                <div className="h-60 w-full overflow-hidden bg-slate-200">
                  {profile.profile_pic ? (
                    <img
                      src={`${imageBaseURL}${profile.profile_pic}`}
                      alt={profile.name || 'Profil'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-slate-200 text-slate-500">
                      Image non disponible
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-slate-900">{profile.name || 'Profil'}</h2>
                  <p className="mt-2 text-sm text-slate-600">{profile.bio || 'Aucune description'}</p>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
