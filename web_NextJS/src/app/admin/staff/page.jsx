'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminStaff() {
  const { token, ready, admin } = useAdminAuth();
  const [staff, setStaff] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const basUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lovmy.dontmove.app/api/';
  const headers = { Authorization: `Bearer ${token}` };

  const fetchStaff = () => {
    if (!token) return;
    axios.get(`${basUrl}admin/staff`, { headers }).then((r) => setStaff(r.data.data ?? [])).catch(console.error);
  };

  useEffect(() => { if (ready) fetchStaff(); }, [ready, token]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      await axios.post(`${basUrl}admin/staff`, { username, password }, { headers });
      setUsername(''); setPassword('');
      fetchStaff();
    } catch (err) {
      const errors = err.response?.data?.errors;
      setMsg(errors ? Object.values(errors).flat().join(' ') : 'Erreur lors de la création.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (id === admin?.id) { alert('Vous ne pouvez pas supprimer votre propre compte.'); return; }
    if (!confirm('Supprimer cet admin ?')) return;
    await axios.delete(`${basUrl}admin/staff/${id}`, { headers });
    fetchStaff();
  };

  if (!ready) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-serif text-2xl text-white">Personnel (Admins)</h1>

      <form onSubmit={handleAdd} className="space-y-4 rounded-2xl border border-[var(--line)] bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold text-[var(--txt-soft)]">Ajouter un admin</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-[var(--txt-faint)]">Identifiant</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full rounded-xl border border-[var(--line)] bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-ember" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--txt-faint)]">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-xl border border-[var(--line)] bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-ember" />
          </div>
        </div>
        {msg && <p className="text-sm text-ember">{msg}</p>}
        <button type="submit" disabled={saving} className="rounded-xl bg-gradient-passion px-5 py-2 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(235,6,3,0.35)] transition hover:brightness-110 disabled:opacity-60">
          {saving ? 'Création…' : 'Créer'}
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white/[0.03]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] text-left text-[var(--txt-faint)]">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Identifiant</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-b border-[var(--line)] hover:bg-white/[0.03]">
                <td className="px-4 py-3 text-xs text-[var(--txt-faint)]">{s.id}</td>
                <td className="px-4 py-3 font-medium text-white">{s.username}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(s.id)} className="rounded-lg bg-ember/10 px-3 py-1 text-xs text-ember transition hover:bg-ember/20">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
