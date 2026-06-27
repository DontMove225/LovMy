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

  const basUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lovmy.dontmove.app/api/v1/';
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
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Personnel (Admins)</h1>

      <form onSubmit={handleAdd} className="rounded-2xl border border-slate-700 bg-slate-800 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-300">Ajouter un admin</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-slate-400">Identifiant</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full rounded-xl border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-violet-500" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-xl border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-violet-500" />
          </div>
        </div>
        {msg && <p className="text-sm text-red-400">{msg}</p>}
        <button type="submit" disabled={saving} className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60 transition">
          {saving ? 'Création…' : 'Créer'}
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-400">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Identifiant</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="px-4 py-3 text-slate-500 text-xs">{s.id}</td>
                <td className="px-4 py-3 text-white font-medium">{s.username}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(s.id)} className="rounded-lg bg-red-900/50 px-3 py-1 text-xs text-red-400 hover:bg-red-800 transition">
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
