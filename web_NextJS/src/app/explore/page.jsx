'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MyContext } from '@/context/MyProvider';
import { useContext } from 'react';
import axios from 'axios';

export default function ExplorePage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { basUrl } = useContext(MyContext);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    const data = localStorage.getItem('Register_User');
    if (!token || !data) {
      router.replace('/login');
      return;
    }
    fetchProfiles();
  }, [router, basUrl]);

  const fetchProfiles = async () => {
    const stored = localStorage.getItem('Register_User');
    if (!stored) return;
    const user = JSON.parse(stored);

    try {
      const response = await axios.post(`${basUrl}home_data.php`, {
        uid: user.id,
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

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl bg-white p-8 shadow-xl">
          <h1 className="text-3xl font-semibold text-slate-900">Explorer</h1>
          <p className="mt-3 text-slate-600">Les profils recommandés par l'API.</p>
        </section>

        {loading ? (
          <div className="rounded-3xl bg-white p-8 shadow-xl">Chargement...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {profiles.length ? profiles.map((profile) => (
              <article key={profile.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="font-semibold text-slate-900">{profile.name || 'Profil'}</p>
                <p className="mt-2 text-sm text-slate-600">{profile.bio || 'Aucune description'}</p>
              </article>
            )) : (
              <div className="rounded-3xl bg-white p-8 shadow-xl">Aucun profil trouvé.</div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
