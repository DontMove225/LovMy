'use client';

import { useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MyContext } from '@/context/MyProvider';
import ProfileCard from '../components/explore/ProfileCard';

const TABS = [
  { key: 'discover', label: 'Découverte', endpoint: 'home_data.php' },
  { key: 'likedMe', label: 'Qui m’a liké', endpoint: 'like_me.php' },
  { key: 'favourites', label: 'Favoris', endpoint: 'favourite.php' },
  { key: 'passed', label: 'Passés', endpoint: 'passed.php' },
];

function haversineKm(lat1, lon1, lat2, lon2) {
  const a = Number(lat1), b = Number(lon1), c = Number(lat2), d = Number(lon2);
  if (!a || !b || !c || !d) return null;
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(c - a);
  const dLon = toRad(d - b);
  const sinLat = Math.sin(dLat / 2) ** 2;
  const sinLon = Math.sin(dLon / 2) ** 2;
  const h = sinLat + Math.cos(toRad(a)) * Math.cos(toRad(c)) * sinLon;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function sharedInterestPct(mineJson, theirsJson) {
  try {
    const mine = new Set(JSON.parse(mineJson || '[]'));
    const theirs = JSON.parse(theirsJson || '[]');
    if (!theirs.length) return null;
    const shared = theirs.filter((x) => mine.has(x)).length;
    return Math.round((shared / theirs.length) * 100);
  } catch {
    return null;
  }
}

export default function ExplorePage() {
  const router = useRouter();
  const { apiPost, imageBaseURL, getStoredUser } = useContext(MyContext);
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState('discover');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

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

  const extractProfile = (item) => item.user || item.profile || item;

  const fetchTab = useCallback(async (key, currentMe) => {
    if (!currentMe) return;
    setLoading(true);
    const { endpoint } = TABS.find((t) => t.key === key);
    try {
      const result = await apiPost(endpoint, {
        uid: currentMe.id,
        lats: currentMe.lats || 0,
        longs: currentMe.longs || 0,
      });
      if (result.Result === 'true') {
        setProfiles((result.data || []).map(extractProfile));
      } else {
        setProfiles([]);
      }
    } catch (error) {
      console.error(error);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [apiPost]);

  useEffect(() => {
    if (me) fetchTab(tab, me);
  }, [tab, me, fetchTab]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleAction = async (profile, action) => {
    if (!me) return;
    setProfiles((prev) => prev.filter((p) => p.id !== profile.id));
    try {
      const result = await apiPost('like_dislike.php', {
        uid: me.id,
        profile_id: profile.id,
        action,
      });
      if (action === 'LIKE' && result.is_match) {
        showToast(`✨ Nouveau match avec ${profile.name} !`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen bg-obsidian px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
          <span className="font-mono text-xs uppercase tracking-[0.32em] text-ember">Découverte</span>
          <h1 className="mt-2 font-serif text-3xl text-white">Trouvez votre match</h1>
          <p className="mt-2 text-[var(--txt-soft)]">Les profils recommandés par LovMy, classés selon vos préférences.</p>

          <div className="mt-6 flex flex-wrap gap-2">
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
        </section>

        {toast ? (
          <div className="rounded-2xl border border-ember/30 bg-ember/10 px-5 py-3 text-center font-serif text-lg text-white">
            {toast}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8 text-center text-[var(--txt-soft)]">
            Chargement…
          </div>
        ) : profiles.length === 0 ? (
          <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8 text-center text-[var(--txt-soft)]">
            Aucun profil pour le moment.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                imageBaseURL={imageBaseURL}
                distanceKm={me ? haversineKm(me.lats, me.longs, profile.lats, profile.longs) : null}
                compatPct={me ? sharedInterestPct(me.interest, profile.interest) : null}
                onLike={tab === 'discover' || tab === 'likedMe' ? () => handleAction(profile, 'LIKE') : undefined}
                onPass={tab === 'discover' ? () => handleAction(profile, 'UNLIKE') : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
