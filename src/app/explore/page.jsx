'use client';

import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MyContext } from '@/context/MyProvider';
import { FiSliders, FiHeart } from 'react-icons/fi';
import ProfileCard from '../components/explore/ProfileCard';
import FilterPanel from '../components/explore/FilterPanel';

const EMPTY_FILTERS = {
  gender: '', min_age: '', max_age: '', max_distance: '',
  relation_goal: '', religion: '', interest: '', language: '',
  verified_only: false, premium_only: false,
};

const TABS = [
  { key: 'discover', label: 'Découverte', endpoint: 'home_data.php', icon: FiHeart },
  { key: 'likedMe', label: 'Qui m’a liké', endpoint: 'like_me.php', icon: FiHeart },
  { key: 'favourites', label: 'Favoris', endpoint: 'favourite.php', icon: FiHeart },
  { key: 'passed', label: 'Passés', endpoint: 'passed.php', icon: FiHeart },
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

function photoCount(profile) {
  try {
    const others = JSON.parse(profile.other_pic || '[]');
    return 1 + (Array.isArray(others) ? others.length : 0);
  } catch {
    return 1;
  }
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
  const { apiPost, apiGet, imageBaseURL, getStoredUser } = useContext(MyContext);
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState('discover');
  const [profiles, setProfiles] = useState([]);
  const [distanceFallback, setDistanceFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS);
  const [lists, setLists] = useState({ goals: [], religions: [], interests: [], languages: [] });
  const [gifts, setGifts] = useState([]);
  const [matchedIds, setMatchedIds] = useState(new Set());

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

  useEffect(() => {
    (async () => {
      try {
        const [goals, religions, interests, languages] = await Promise.all([
          apiGet('goal.php'), apiGet('religionlist.php'), apiGet('interest.php'), apiGet('languagelist.php'),
        ]);
        setLists({
          goals: goals.data || [], religions: religions.data || [],
          interests: interests.data || [], languages: languages.data || [],
        });
      } catch (error) {
        console.error(error);
      }
    })();
  }, [apiGet]);

  useEffect(() => {
    (async () => {
      try {
        const result = await apiPost('gift_list.php', {});
        setGifts(result.Result === 'true' ? (result.data || []) : []);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [apiPost]);

  useEffect(() => {
    if (!me) return;
    (async () => {
      try {
        const result = await apiPost('new_match.php', { uid: me.id });
        if (result.Result === 'true') {
          const ids = (result.data || []).map((m) => (m.user || m.profile || m).id);
          setMatchedIds(new Set(ids));
        }
      } catch (error) {
        console.error(error);
      }
    })();
  }, [me, apiPost]);

  const extractProfile = (item) => item.user || item.profile || item;

  const enrichedProfiles = useMemo(() => profiles.map((profile) => ({
    profile,
    distanceKm: me ? haversineKm(me.lats, me.longs, profile.lats, profile.longs) : null,
    compatPct: me ? sharedInterestPct(me.interest, profile.interest) : null,
    photos: photoCount(profile),
  })), [profiles, me]);

  const hasActiveFilters = (f) => Object.values(f).some((v) => v !== '' && v !== false);

  const fetchTab = useCallback(async (key, currentMe, currentFilters) => {
    if (!currentMe) return;
    setLoading(true);
    try {
      let result;
      if (key === 'discover' && hasActiveFilters(currentFilters)) {
        result = await apiPost('filter.php', {
          uid: currentMe.id,
          ...currentFilters,
          min_age: currentFilters.min_age || undefined,
          max_age: currentFilters.max_age || undefined,
          max_distance: currentFilters.max_distance || undefined,
        });
      } else {
        const { endpoint } = TABS.find((t) => t.key === key);
        result = await apiPost(endpoint, {
          uid: currentMe.id,
          lats: currentMe.lats || 0,
          longs: currentMe.longs || 0,
        });
      }

      if (result.Result === 'true') {
        setProfiles((result.data || []).map(extractProfile));
        setDistanceFallback(Boolean(result.fallback));
      } else {
        setProfiles([]);
        setDistanceFallback(false);
      }
    } catch (error) {
      console.error(error);
      setProfiles([]);
      setDistanceFallback(false);
    } finally {
      setLoading(false);
    }
  }, [apiPost]);

  useEffect(() => {
    if (me) fetchTab(tab, me, activeFilters);
  }, [tab, me, activeFilters, fetchTab]);

  const handleApplyFilters = () => {
    setActiveFilters(filters);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setActiveFilters(EMPTY_FILTERS);
  };

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

  const handleGift = async (profile, gift) => {
    if (!me) return;
    try {
      const result = await apiPost('giftbuy.php', {
        uid: me.id,
        receiver_id: profile.id,
        gift_id: gift.id,
      });
      showToast(
        result.Result === 'true'
          ? `${gift.img} envoyé à ${profile.name} !`
          : result.ResponseMsg || 'Coins insuffisants pour ce cadeau.'
      );
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

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                    tab === t.key
                      ? 'bg-gradient-passion text-white shadow-[0_6px_18px_rgba(235,6,3,0.35)]'
                      : 'border border-[var(--line)] text-[var(--txt-soft)] hover:text-white'
                  }`}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              ))}
            </div>
            {tab === 'discover' ? (
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                  hasActiveFilters(activeFilters)
                    ? 'border-ember/40 bg-ember/10 text-white'
                    : 'border-[var(--line)] text-[var(--txt-soft)] hover:text-white'
                }`}
              >
                <FiSliders className="h-4 w-4" /> Filtres
              </button>
            ) : null}
          </div>
        </section>

        {showFilters && tab === 'discover' ? (
          <FilterPanel
            lists={lists}
            filters={filters}
            setFilters={setFilters}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
            onClose={() => setShowFilters(false)}
          />
        ) : null}

        {toast ? (
          <div className="rounded-2xl border border-ember/30 bg-ember/10 px-5 py-3 text-center font-serif text-lg text-white">
            {toast}
          </div>
        ) : null}

        {!loading && distanceFallback && profiles.length > 0 ? (
          <div className="rounded-2xl border border-[var(--line)] bg-white/[0.03] px-5 py-3 text-center text-sm text-[var(--txt-soft)]">
            Aucun profil dans le rayon demandé — voici les profils les plus proches disponibles.
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
            {enrichedProfiles.map(({ profile, distanceKm, compatPct, photos }) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                imageBaseURL={imageBaseURL}
                distanceKm={distanceKm}
                compatPct={compatPct}
                photoCount={photos}
                canChat={Boolean(me?.direct_chat) || matchedIds.has(profile.id)}
                gifts={gifts}
                onLike={tab === 'discover' || tab === 'likedMe' ? () => handleAction(profile, 'LIKE') : undefined}
                onPass={tab === 'discover' ? () => handleAction(profile, 'UNLIKE') : undefined}
                onGift={(gift) => handleGift(profile, gift)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
