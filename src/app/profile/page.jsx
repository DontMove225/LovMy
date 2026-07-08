'use client';

import { useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MyContext } from '@/context/MyProvider';
import { FiEdit2, FiCheckCircle, FiStar } from 'react-icons/fi';

function calcAge(birthDate) {
  if (!birthDate) return null;
  const dob = new Date(birthDate);
  if (Number.isNaN(dob.getTime())) return null;
  return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

function parseJsonArray(raw) {
  try {
    const arr = JSON.parse(raw || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const { apiPost, apiGet, imageBaseURL, getStoredUser } = useContext(MyContext);
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [religions, setReligions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    const data = localStorage.getItem('Register_User');
    if (!token || !data) {
      router.replace('/login');
      return;
    }
    setUser(JSON.parse(data));
  }, [router]);

  const load = useCallback(async (uid) => {
    setLoading(true);
    try {
      const [profileRes, goalsRes, religionsRes] = await Promise.all([
        apiPost('profile_info.php', { uid }),
        apiGet('goal.php'),
        apiGet('religionlist.php'),
      ]);
      if (profileRes.Result === 'true') setUser(profileRes.UserData);
      setGoals(goalsRes.data || []);
      setReligions(religionsRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [apiPost, apiGet]);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) load(stored.id);
  }, [getStoredUser, load]);

  if (!user || loading) {
    return (
      <main className="min-h-screen bg-obsidian px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8 text-[var(--txt-soft)]">
          Chargement…
        </div>
      </main>
    );
  }

  const age = calcAge(user.birth_date);
  const photos = [user.profile_pic, ...parseJsonArray(user.other_pic)].filter(Boolean);
  const goalTitle = goals.find((g) => g.id === user.relation_goal)?.title;
  const religionTitle = religions.find((r) => r.id === user.religion)?.title;
  const interests = parseJsonArray(user.interest);
  const languages = parseJsonArray(user.language);

  return (
    <main className="min-h-screen bg-obsidian px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-3xl border border-[var(--line)] bg-white/[0.03]">
          <div
            className="relative h-72 w-full"
            style={{ background: 'linear-gradient(160deg, var(--steel), var(--velvet) 60%, var(--nightred))' }}
          >
            {photos.length > 0 ? (
              <img src={`${imageBaseURL}${photos[0]}`} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center font-serif text-8xl text-white/20">
                {user.name?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}

            {user.is_verify ? (
              <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-obsidian/60 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-blush backdrop-blur">
                <FiCheckCircle className="h-3.5 w-3.5" /> Vérifié
              </span>
            ) : null}
            {user.is_subscribe ? (
              <span className="absolute right-4 top-14 flex items-center gap-1 rounded-full bg-gradient-passion px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-white">
                <FiStar className="h-3.5 w-3.5" /> Premium
              </span>
            ) : null}

            <Link
              href="/settings"
              className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-obsidian/70 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-obsidian"
            >
              <FiEdit2 className="h-4 w-4" /> Modifier
            </Link>
          </div>

          <div className="p-8">
            <h1 className="font-serif text-3xl text-white">
              {user.name}{age ? `, ${age}` : ''}
            </h1>
            <p className="mt-1 text-sm text-[var(--txt-faint)]">{user.email}</p>
            {user.height ? <p className="mt-1 text-sm text-[var(--txt-faint)]">{user.height} cm</p> : null}
            {user.profile_bio ? <p className="mt-4 text-[var(--txt-soft)]">{user.profile_bio}</p> : null}

            <div className="mt-6 flex flex-wrap gap-2 font-mono text-xs uppercase tracking-wide text-[var(--txt-faint)]">
              {goalTitle ? <span className="rounded-full border border-[var(--line)] px-3 py-1.5 text-blush">{goalTitle}</span> : null}
              {religionTitle ? <span className="rounded-full border border-[var(--line)] px-3 py-1.5">{religionTitle}</span> : null}
            </div>

            {interests.length > 0 ? (
              <div className="mt-6">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[var(--txt-faint)]">Centres d&apos;intérêt</p>
                <div className="flex flex-wrap gap-2">
                  {interests.map((i) => (
                    <span key={i} className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs text-[var(--txt-soft)]">{i}</span>
                  ))}
                </div>
              </div>
            ) : null}

            {languages.length > 0 ? (
              <div className="mt-4">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[var(--txt-faint)]">Langues</p>
                <div className="flex flex-wrap gap-2">
                  {languages.map((l) => (
                    <span key={l} className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs text-[var(--txt-soft)]">{l}</span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
