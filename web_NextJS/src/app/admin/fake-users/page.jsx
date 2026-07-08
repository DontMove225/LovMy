'use client';

import { useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminFakeUsers() {
  const { token, ready } = useAdminAuth();
  const [form, setForm] = useState({ name: '', mobile: '', gender: 'FEMALE', birth_date: '', lats: '', longs: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [lastCreated, setLastCreated] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg(''); setLastCreated(null);
    try {
      const basUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lovmy.dontmove.app/api/';
      const res = await axios.post(`${basUrl}admin/fake-users`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLastCreated(res.data.data);
      setForm({ name: '', mobile: '', gender: 'FEMALE', birth_date: '', lats: '', longs: '' });
    } catch (err) {
      const errors = err.response?.data?.errors;
      setMsg(errors ? Object.values(errors).flat().join(' ') : 'Erreur lors de la création.');
    } finally {
      setSaving(false);
    }
  };

  if (!ready) return null;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-serif text-2xl text-white">Générateur de Faux Utilisateurs</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[var(--line)] bg-white/[0.03] p-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-[var(--txt-faint)]">Nom</label>
            <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full rounded-xl border border-[var(--line)] bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-ember" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--txt-faint)]">Mobile (unique)</label>
            <input value={form.mobile} onChange={(e) => setForm(f => ({ ...f, mobile: e.target.value }))} required className="w-full rounded-xl border border-[var(--line)] bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-ember" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--txt-faint)]">Genre</label>
            <select value={form.gender} onChange={(e) => setForm(f => ({ ...f, gender: e.target.value }))} className="w-full rounded-xl border border-[var(--line)] bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-ember">
              <option value="FEMALE">Femme</option>
              <option value="MALE">Homme</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--txt-faint)]">Date de naissance</label>
            <input type="date" value={form.birth_date} onChange={(e) => setForm(f => ({ ...f, birth_date: e.target.value }))} className="w-full rounded-xl border border-[var(--line)] bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-ember" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--txt-faint)]">Latitude</label>
            <input type="number" step="any" value={form.lats} onChange={(e) => setForm(f => ({ ...f, lats: e.target.value }))} placeholder="ex: 48.8566" className="w-full rounded-xl border border-[var(--line)] bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-ember" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--txt-faint)]">Longitude</label>
            <input type="number" step="any" value={form.longs} onChange={(e) => setForm(f => ({ ...f, longs: e.target.value }))} placeholder="ex: 2.3522" className="w-full rounded-xl border border-[var(--line)] bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-ember" />
          </div>
        </div>

        {msg && <p className="text-sm text-ember">{msg}</p>}

        <button type="submit" disabled={saving} className="w-full rounded-xl bg-gradient-passion py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(235,6,3,0.35)] transition hover:brightness-110 disabled:opacity-60">
          {saving ? 'Création…' : 'Créer le faux utilisateur'}
        </button>
      </form>

      {lastCreated && (
        <div className="rounded-2xl border border-emerald-800 bg-emerald-900/30 p-5">
          <p className="mb-2 text-sm font-semibold text-emerald-400">Faux utilisateur créé</p>
          <p className="text-sm text-[var(--txt-soft)]">Nom : <span className="text-white">{lastCreated.name}</span></p>
          <p className="text-sm text-[var(--txt-soft)]">Mobile : <span className="text-white">{lastCreated.mobile}</span></p>
          <p className="text-sm text-[var(--txt-soft)]">ID : <span className="text-white">#{lastCreated.id}</span></p>
        </div>
      )}
    </div>
  );
}
