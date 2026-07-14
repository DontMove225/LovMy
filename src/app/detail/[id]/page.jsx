'use client';

import { useCallback, useContext, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MyContext } from '@/context/MyProvider';
import { FiArrowLeft, FiHeart, FiX, FiSlash, FiFlag, FiMapPin, FiCheckCircle, FiStar } from 'react-icons/fi';

function calcAge(birthDate) {
  if (!birthDate) return null;
  const dob = new Date(birthDate);
  if (Number.isNaN(dob.getTime())) return null;
  return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const a = Number(lat1), b = Number(lon1), c = Number(lat2), d = Number(lon2);
  if (!a || !b || !c || !d) return null;
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(c - a);
  const dLon = toRad(d - b);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function parseJsonArray(raw) {
  try {
    const arr = JSON.parse(raw || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();
  const { apiPost, apiGet, imageBaseURL, getStoredUser } = useContext(MyContext);

  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);
  const [goals, setGoals] = useState([]);
  const [religions, setReligions] = useState([]);
  const [activePhoto, setActivePhoto] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

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

  const load = useCallback(async (uid, profileId) => {
    setLoading(true);
    try {
      const [profileRes, goalsRes, religionsRes] = await Promise.all([
        apiPost('profile_view.php', { uid, profile_id: profileId }),
        apiGet('goal.php'),
        apiGet('religionlist.php'),
      ]);
      if (profileRes.Result === 'true') setProfile(profileRes.data);
      setGoals(goalsRes.data || []);
      setReligions(religionsRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [apiPost, apiGet]);

  useEffect(() => {
    if (me && params.id) load(me.id, params.id);
  }, [me, params.id, load]);

  const handleAction = async (action) => {
    if (!me || !profile) return;
    try {
      const result = await apiPost('like_dislike.php', { uid: me.id, profile_id: profile.id, action });
      if (action === 'LIKE' && result.is_match) {
        setActionMsg(`✨ Nouveau match avec ${profile.name} !`);
      } else {
        setActionMsg(action === 'LIKE' ? 'Profil liké.' : 'Profil passé.');
        router.push('/explore');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleBlock = async () => {
    if (!me || !profile) return;
    if (!confirm(`Bloquer ${profile.name} ?`)) return;
    try {
      await apiPost('profile_block.php', { uid: me.id, profile_id: profile.id });
      setActionMsg('Utilisateur bloqué.');
      router.push('/explore');
    } catch (error) {
      console.error(error);
    }
  };

  const handleReport = async (event) => {
    event.preventDefault();
    if (!me || !profile || !reportReason.trim()) return;
    try {
      await apiPost('report.php', { uid: profile.id, reporter_id: me.id, comment: reportReason.trim() });
      setActionMsg('Signalement envoyé, merci.');
      setReportOpen(false);
      setReportReason('');
    } catch (error) {
      console.error(error);
    }
  };

  if (!me || loading) {
    return (
      <main className="min-h-screen bg-obsidian px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8 text-[var(--txt-soft)]">
          Chargement…
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-obsidian px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8 text-center text-[var(--txt-soft)]">
          Profil introuvable.
          <Link href="/explore" className="mt-4 block text-blush hover:underline">Retour à la découverte</Link>
        </div>
      </main>
    );
  }

  const age = calcAge(profile.birth_date);
  const distance = haversineKm(me.lats, me.longs, profile.lats, profile.longs);
  const photos = [profile.profile_pic, ...parseJsonArray(profile.other_pic)].filter(Boolean);
  const goalTitle = goals.find((g) => g.id === profile.relation_goal)?.title;
  const religionTitle = religions.find((r) => r.id === profile.religion)?.title;
  const interests = parseJsonArray(profile.interest);
  const languages = parseJsonArray(profile.language);

  return (
    <main className="min-h-screen bg-obsidian px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/explore" className="mb-5 inline-flex items-center gap-2 text-sm text-[var(--txt-soft)] hover:text-white">
          <FiArrowLeft className="h-4 w-4" /> Retour
        </Link>

        {actionMsg ? (
          <div className="mb-5 rounded-2xl border border-ember/30 bg-ember/10 px-5 py-3 text-center font-serif text-white">
            {actionMsg}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-3xl border border-[var(--line)] bg-white/[0.03]">
          {/* Gallery */}
          <div
            className="relative h-96 w-full"
            style={{ background: 'linear-gradient(160deg, var(--steel), var(--velvet) 60%, var(--nightred))' }}
          >
            {photos.length > 0 ? (
              <Image
                src={`${imageBaseURL}${photos[activePhoto]}`}
                alt={profile.name}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-serif text-8xl text-white/20">
                {profile.name?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}

            {profile.is_verify ? (
              <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-obsidian/60 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-blush backdrop-blur">
                <FiCheckCircle className="h-3.5 w-3.5" /> Vérifié
              </span>
            ) : null}
            {profile.is_subscribe ? (
              <span className="absolute right-4 top-14 flex items-center gap-1 rounded-full bg-gradient-passion px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-white">
                <FiStar className="h-3.5 w-3.5" /> Premium
              </span>
            ) : null}
            {distance != null ? (
              <span className="absolute bottom-4 left-4 flex items-center gap-1 rounded-full bg-obsidian/60 px-3 py-1.5 font-mono text-xs text-white backdrop-blur">
                <FiMapPin className="h-3.5 w-3.5" /> {distance.toFixed(0)} km
              </span>
            ) : null}

            {photos.length > 1 ? (
              <div className="absolute bottom-4 right-4 flex gap-1.5">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(i)}
                    className={`h-2 w-2 rounded-full transition ${i === activePhoto ? 'bg-ember' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="p-8">
            <h1 className="font-serif text-3xl text-white">
              {profile.name}{age ? `, ${age}` : ''}
            </h1>
            {profile.height ? <p className="mt-1 text-sm text-[var(--txt-faint)]">{profile.height} cm</p> : null}
            {profile.profile_bio ? <p className="mt-4 text-[var(--txt-soft)]">{profile.profile_bio}</p> : null}

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

            {/* Actions */}
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[var(--line)] pt-6">
              <button
                onClick={() => handleAction('UNLIKE')}
                className="grid h-12 w-12 place-items-center rounded-full border border-[var(--line)] text-[var(--txt-soft)] transition hover:text-ember"
                aria-label="Passer"
              >
                <FiX className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleAction('LIKE')}
                className="grid h-12 w-12 place-items-center rounded-full bg-gradient-passion text-white shadow-[0_10px_24px_rgba(235,6,3,0.45)] transition hover:brightness-110"
                aria-label="Liker"
              >
                <FiHeart className="h-5 w-5" />
              </button>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setReportOpen((v) => !v)}
                  className="flex items-center gap-1.5 rounded-full border border-[var(--line)] px-3 py-2 text-xs text-[var(--txt-soft)] transition hover:text-white"
                >
                  <FiFlag className="h-3.5 w-3.5" /> Signaler
                </button>
                <button
                  onClick={handleBlock}
                  className="flex items-center gap-1.5 rounded-full border border-[var(--line)] px-3 py-2 text-xs text-[var(--txt-soft)] transition hover:border-ember/40 hover:text-ember"
                >
                  <FiSlash className="h-3.5 w-3.5" /> Bloquer
                </button>
              </div>
            </div>

            {reportOpen ? (
              <form onSubmit={handleReport} className="mt-4 space-y-3 rounded-2xl border border-[var(--line)] bg-white/[0.02] p-4">
                <label className="block text-sm text-[var(--txt-soft)]">Motif du signalement</label>
                <textarea
                  rows={3}
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Décrivez le problème..."
                  className="w-full resize-none rounded-xl border border-[var(--line)] bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-ember"
                />
                <button
                  type="submit"
                  disabled={!reportReason.trim()}
                  className="rounded-xl bg-gradient-passion px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                >
                  Envoyer le signalement
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
