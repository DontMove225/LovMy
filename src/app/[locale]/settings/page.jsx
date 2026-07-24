'use client';

import { useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MyContext } from '@/context/MyProvider';
import { FiPlus, FiX, FiLock, FiChevronRight } from 'react-icons/fi';
import HeartbeatLoader from '@/components/ui/HeartbeatLoader';

const MAX_PHOTOS = 6;

function ChipGroup({ options, selected, onToggle, multi = true }) {
  const isSelected = (id) => (multi ? selected.includes(id) : selected === id);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onToggle(opt.id)}
          className={`rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wide transition ${
            isSelected(opt.id)
              ? 'border-ember bg-gradient-passion text-white shadow-[0_6px_18px_rgba(235,6,3,0.35)]'
              : 'border-[var(--line)] text-[var(--txt-soft)] hover:border-blush/40 hover:text-white'
          }`}
        >
          {opt.title}
        </button>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { apiPost, apiGet, imageBaseURL, getStoredUser } = useContext(MyContext);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [photoBusy, setPhotoBusy] = useState(false);

  const [lists, setLists] = useState({ interests: [], languages: [], religions: [], goals: [] });
  const [profilePic, setProfilePic] = useState(null);
  const [otherPics, setOtherPics] = useState([]);

  const [form, setForm] = useState({
    name: '', profile_bio: '', birth_date: '', gender: 'FEMALE',
    search_preference: 'ALL', radius_search: '50', height: '',
    relation_goal: 0, religion: 0, interest: [], language: [],
  });

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

  const loadLists = useCallback(async () => {
    try {
      const [interests, languages, religions, goals] = await Promise.all([
        apiGet('interest.php'),
        apiGet('languagelist.php'),
        apiGet('religionlist.php'),
        apiGet('goal.php'),
      ]);
      setLists({
        interests: interests.data || [],
        languages: languages.data || [],
        religions: religions.data || [],
        goals: goals.data || [],
      });
    } catch (error) {
      console.error(error);
    }
  }, [apiGet]);

  const syncStoredUser = (patch) => {
    localStorage.setItem('Register_User', JSON.stringify({ ...getStoredUser(), ...patch }));
  };

  const loadProfile = useCallback(async (uid) => {
    setLoading(true);
    try {
      const result = await apiPost('profile_info.php', { uid });
      if (result.Result === 'true' && result.UserData) {
        const u = result.UserData;
        setForm({
          name: u.name || '',
          profile_bio: u.profile_bio || '',
          birth_date: u.birth_date ? u.birth_date.substring(0, 10) : '',
          gender: u.gender || 'FEMALE',
          search_preference: u.search_preference || 'ALL',
          radius_search: u.radius_search || '50',
          height: u.height || '',
          relation_goal: u.relation_goal || 0,
          religion: u.religion || 0,
          interest: JSON.parse(u.interest || '[]'),
          language: JSON.parse(u.language || '[]'),
        });
        setProfilePic(u.profile_pic || null);
        try {
          setOtherPics(JSON.parse(u.other_pic || '[]'));
        } catch {
          setOtherPics([]);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [apiPost]);

  useEffect(() => {
    if (me) {
      loadLists();
      loadProfile(me.id);
    }
  }, [me, loadLists, loadProfile]);

  const toggleMulti = (key, id) => {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(id) ? f[key].filter((x) => x !== id) : [...f[key], id],
    }));
  };

  const handleAddPhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setPhotoBusy(true);
    setMsg('');
    const data = new FormData();
    data.append('image', file);
    try {
      if (!profilePic) {
        const result = await apiPost('pro_image.php', data);
        if (result.Result === 'true') {
          setProfilePic(result.ImagePath);
          syncStoredUser({ profile_pic: result.ImagePath });
        }
      } else {
        const result = await apiPost('other_image.php', data);
        if (result.Result === 'true') {
          const all = result.AllPhotos || [];
          setOtherPics(all);
          syncStoredUser({ other_pic: JSON.stringify(all) });
        }
      }
    } catch (error) {
      console.error(error);
      setMsg('Erreur lors de l\'upload de la photo.');
    } finally {
      setPhotoBusy(false);
    }
  };

  const handleRemovePhoto = async (slot) => {
    setPhotoBusy(true);
    setMsg('');
    try {
      if (slot.type === 'profile') {
        const result = await apiPost('delete_image.php', { type: 'profile' });
        if (result.Result === 'true') {
          setProfilePic(null);
          syncStoredUser({ profile_pic: null });
        }
      } else {
        const result = await apiPost('delete_image.php', { type: 'other', image: slot.url });
        if (result.Result === 'true') {
          let all = [];
          try { all = JSON.parse(result.UserData?.other_pic || '[]'); } catch { all = []; }
          setOtherPics(all);
          syncStoredUser({ other_pic: result.UserData?.other_pic ?? '[]' });
        }
      }
    } catch (error) {
      console.error(error);
      setMsg('Erreur lors de la suppression de la photo.');
    } finally {
      setPhotoBusy(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const result = await apiPost('edit_profile.php', {
        name: form.name,
        profile_bio: form.profile_bio,
        birth_date: form.birth_date,
        gender: form.gender,
        search_preference: form.search_preference,
        radius_search: form.radius_search,
        height: form.height,
        relation_goal: form.relation_goal,
        religion: form.religion,
        interest: JSON.stringify(form.interest),
        language: JSON.stringify(form.language),
      });
      if (result.Result === 'true') {
        setMsg('Profil mis à jour avec succès.');
        if (result.UserData) {
          localStorage.setItem('Register_User', JSON.stringify(result.UserData));
        }
      } else {
        setMsg(result.ResponseMsg || 'Erreur lors de la mise à jour.');
      }
    } catch (error) {
      console.error(error);
      setMsg('Erreur réseau, réessayez plus tard.');
    } finally {
      setSaving(false);
    }
  };

  if (!me || loading) {
    return (
      <main className="min-h-screen bg-obsidian px-4 py-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 rounded-3xl border border-[var(--line)] bg-white/[0.03] p-14 text-[var(--txt-soft)]">
          <HeartbeatLoader size={56} />
          Chargement…
        </div>
      </main>
    );
  }

  const inputClass = "w-full rounded-2xl border border-[var(--line)] bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-ember";
  const labelClass = "mb-1.5 block text-sm font-medium text-[var(--txt-soft)]";

  const photoSlots = [
    ...(profilePic ? [{ type: 'profile', url: profilePic }] : []),
    ...otherPics.map((url) => ({ type: 'other', url })),
  ];

  return (
    <main className="min-h-screen bg-obsidian px-4 py-10">
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6 animate-rise">
        <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
          <span className="font-mono text-xs uppercase tracking-[0.32em] text-ember">Mon compte</span>
          <h1 className="mt-2 font-serif text-3xl text-white">Paramètres</h1>
        </div>

        {/* Photos */}
        <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
          <p className="text-sm text-[var(--txt-soft)]">Mettez à jour vos photos personnelles ici.</p>

          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {photoSlots.map((slot) => (
              <div key={slot.url} className="group relative aspect-square overflow-hidden rounded-2xl border border-[var(--line)]">
                <Image
                  src={`${imageBaseURL}${slot.url}`}
                  alt="Photo de profil"
                  fill
                  sizes="200px"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(slot)}
                  disabled={photoBusy}
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-ember text-white shadow-[0_4px_14px_rgba(0,0,0,0.4)] transition hover:brightness-110 disabled:opacity-50"
                  aria-label="Supprimer la photo"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            ))}

            {photoSlots.length < MAX_PHOTOS ? (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--line)] text-[var(--txt-faint)] transition hover:border-ember/40 hover:text-white">
                <FiPlus className="h-6 w-6" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAddPhoto} disabled={photoBusy} />
              </label>
            ) : null}
          </div>
        </div>

        {/* Infos */}
        <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Pseudo</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input value={me.email || ''} disabled className={`${inputClass} cursor-not-allowed opacity-60`} />
            </div>

            <div>
              <label className={labelClass}>Numéro de mobile</label>
              <input value={me.mobile || ''} disabled className={`${inputClass} cursor-not-allowed opacity-60`} />
            </div>
            <div>
              <label className={labelClass}>Mot de passe</label>
              <button
                type="button"
                onClick={() => router.push('/account-security')}
                className={`${inputClass} flex items-center justify-between text-left text-[var(--txt-soft)] transition hover:border-ember/40 hover:text-white`}
              >
                <span className="flex items-center gap-2"><FiLock className="h-4 w-4" /> ••••••••</span>
                <FiChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--txt-soft)]">Distance de recherche</span>
                <span className="font-mono text-sm text-ember">{Number(form.radius_search).toFixed(1)} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="500"
                value={form.radius_search}
                onChange={(e) => setForm((f) => ({ ...f, radius_search: e.target.value }))}
                className="mt-3 w-full accent-ember"
              />
            </div>
            <div>
              <label className={labelClass}>Date de naissance</label>
              <input type="date" value={form.birth_date} onChange={(e) => setForm((f) => ({ ...f, birth_date: e.target.value }))} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Bio</label>
              <textarea
                rows={3}
                value={form.profile_bio}
                onChange={(e) => setForm((f) => ({ ...f, profile_bio: e.target.value }))}
                placeholder="Parlez un peu de vous..."
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <label className={labelClass}>Genre</label>
              <ChipGroup
                options={[{ id: 'MALE', title: 'Homme' }, { id: 'FEMALE', title: 'Femme' }, { id: 'OTHER', title: 'Autre' }]}
                selected={form.gender}
                multi={false}
                onToggle={(id) => setForm((f) => ({ ...f, gender: id }))}
              />
            </div>

            <div>
              <label className={labelClass}>Centres d&apos;intérêt</label>
              <ChipGroup
                options={lists.interests.map((i) => ({ id: i.title, title: i.title }))}
                selected={form.interest}
                onToggle={(id) => toggleMulti('interest', id)}
              />
            </div>
            <div>
              <label className={labelClass}>Langues parlées</label>
              <ChipGroup
                options={lists.languages.map((l) => ({ id: l.title, title: l.title }))}
                selected={form.language}
                onToggle={(id) => toggleMulti('language', id)}
              />
            </div>

            <div>
              <label className={labelClass}>Taille (cm)</label>
              <input type="number" value={form.height} onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Je recherche</label>
              <ChipGroup
                options={[{ id: 'MALE', title: 'Homme' }, { id: 'FEMALE', title: 'Femme' }, { id: 'ALL', title: 'Peu importe' }]}
                selected={form.search_preference}
                multi={false}
                onToggle={(id) => setForm((f) => ({ ...f, search_preference: id }))}
              />
            </div>

            <div>
              <label className={labelClass}>Religion</label>
              <ChipGroup
                options={lists.religions}
                selected={form.religion}
                multi={false}
                onToggle={(id) => setForm((f) => ({ ...f, religion: id }))}
              />
            </div>
            <div>
              <label className={labelClass}>Objectif relationnel</label>
              <ChipGroup
                options={lists.goals}
                selected={form.relation_goal}
                multi={false}
                onToggle={(id) => setForm((f) => ({ ...f, relation_goal: id }))}
              />
            </div>
          </div>
        </div>

        {msg ? (
          <p className="rounded-2xl border border-ember/30 bg-ember/10 px-5 py-3 text-sm text-white">{msg}</p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="group relative w-full overflow-hidden rounded-2xl bg-gradient-passion px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_34px_-10px_rgba(246,65,53,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-12px_rgba(235,6,3,0.45)] disabled:pointer-events-none disabled:opacity-60"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <span className="relative">{saving ? 'Mise à jour…' : 'Mettre à jour'}</span>
        </button>
      </form>
    </main>
  );
}
