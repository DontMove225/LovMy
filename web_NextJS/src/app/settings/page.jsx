'use client';

import { useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MyContext } from '@/context/MyProvider';
import { FiCamera } from 'react-icons/fi';

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

  const [lists, setLists] = useState({ interests: [], languages: [], religions: [], goals: [] });

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

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append('image', file);
    try {
      const result = await apiPost('pro_image.php', data);
      if (result.Result === 'true') {
        const updatedUser = { ...getStoredUser(), profile_pic: result.ImagePath };
        localStorage.setItem('Register_User', JSON.stringify(updatedUser));
        setMsg('Photo de profil mise à jour.');
      }
    } catch (error) {
      console.error(error);
      setMsg('Erreur lors de l\'upload de la photo.');
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
        <div className="mx-auto max-w-4xl rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8 text-[var(--txt-soft)]">
          Chargement…
        </div>
      </main>
    );
  }

  const inputClass = "w-full rounded-2xl border border-[var(--line)] bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-ember";
  const labelClass = "mb-1.5 block text-sm font-medium text-[var(--txt-soft)]";

  return (
    <main className="min-h-screen bg-obsidian px-4 py-10">
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
          <span className="font-mono text-xs uppercase tracking-[0.32em] text-ember">Mon compte</span>
          <h1 className="mt-2 font-serif text-3xl text-white">Paramètres & confidentialité</h1>
        </div>

        {/* Photo */}
        <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
          <h2 className="font-serif text-lg text-white">Photo de profil</h2>
          <div className="mt-4 flex items-center gap-5">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border border-[var(--line)] bg-gradient-passion">
              {me.profile_pic ? (
                <img src={`${imageBaseURL}${me.profile_pic}`} alt={me.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-serif text-3xl text-white">
                  {me.name?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
            </div>
            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--txt-soft)] transition hover:border-ember/40 hover:text-white">
              <FiCamera className="h-4 w-4" />
              Changer la photo
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
        </div>

        {/* Infos de base */}
        <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
          <h2 className="font-serif text-lg text-white">Informations de base</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Nom</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input value={me.email || ''} disabled className={`${inputClass} cursor-not-allowed opacity-60`} />
            </div>
            <div>
              <label className={labelClass}>Mobile</label>
              <input value={me.mobile || ''} disabled className={`${inputClass} cursor-not-allowed opacity-60`} />
            </div>
            <div>
              <label className={labelClass}>Date de naissance</label>
              <input type="date" value={form.birth_date} onChange={(e) => setForm((f) => ({ ...f, birth_date: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Taille (cm)</label>
              <input type="number" value={form.height} onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
          <h2 className="font-serif text-lg text-white">Bio</h2>
          <textarea
            rows={3}
            value={form.profile_bio}
            onChange={(e) => setForm((f) => ({ ...f, profile_bio: e.target.value }))}
            placeholder="Parlez un peu de vous..."
            className={`${inputClass} mt-4 resize-none`}
          />
        </div>

        {/* Genre & préférences */}
        <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
          <h2 className="font-serif text-lg text-white">Genre & préférences</h2>
          <div className="mt-5 space-y-5">
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
              <label className={labelClass}>Je recherche</label>
              <ChipGroup
                options={[{ id: 'MALE', title: 'Homme' }, { id: 'FEMALE', title: 'Femme' }, { id: 'ALL', title: 'Peu importe' }]}
                selected={form.search_preference}
                multi={false}
                onToggle={(id) => setForm((f) => ({ ...f, search_preference: id }))}
              />
            </div>
            <div>
              <label className={labelClass}>Distance de recherche — {form.radius_search} km</label>
              <input
                type="range"
                min="5"
                max="500"
                value={form.radius_search}
                onChange={(e) => setForm((f) => ({ ...f, radius_search: e.target.value }))}
                className="w-full accent-ember"
              />
            </div>
          </div>
        </div>

        {/* Centres d'intérêt */}
        <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
          <h2 className="font-serif text-lg text-white">Centres d&apos;intérêt</h2>
          <div className="mt-4">
            <ChipGroup
              options={lists.interests.map((i) => ({ id: i.title, title: i.title }))}
              selected={form.interest}
              onToggle={(id) => toggleMulti('interest', id)}
            />
          </div>
        </div>

        {/* Langues */}
        <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
          <h2 className="font-serif text-lg text-white">Langues parlées</h2>
          <div className="mt-4">
            <ChipGroup
              options={lists.languages.map((l) => ({ id: l.title, title: l.title }))}
              selected={form.language}
              onToggle={(id) => toggleMulti('language', id)}
            />
          </div>
        </div>

        {/* Religion */}
        <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
          <h2 className="font-serif text-lg text-white">Religion</h2>
          <div className="mt-4">
            <ChipGroup
              options={lists.religions}
              selected={form.religion}
              multi={false}
              onToggle={(id) => setForm((f) => ({ ...f, religion: id }))}
            />
          </div>
        </div>

        {/* Objectif relationnel */}
        <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
          <h2 className="font-serif text-lg text-white">Objectif relationnel</h2>
          <div className="mt-4">
            <ChipGroup
              options={lists.goals}
              selected={form.relation_goal}
              multi={false}
              onToggle={(id) => setForm((f) => ({ ...f, relation_goal: id }))}
            />
          </div>
        </div>

        {msg ? (
          <p className="rounded-2xl border border-ember/30 bg-ember/10 px-5 py-3 text-sm text-white">{msg}</p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-2xl bg-gradient-passion px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(235,6,3,0.35)] transition hover:brightness-110 disabled:opacity-60"
        >
          {saving ? 'Mise à jour…' : 'Mettre à jour'}
        </button>
      </form>
    </main>
  );
}
