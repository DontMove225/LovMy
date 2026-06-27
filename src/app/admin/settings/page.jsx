'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const FIELDS = [
  { key: 'webname',    label: 'Nom du site',        type: 'text' },
  { key: 'currency',   label: 'Devise',              type: 'text' },
  { key: 'coin_amt',   label: 'Valeur d\'un coin (€)', type: 'number' },
  { key: 'coin_limit', label: 'Seuil retrait (coins)', type: 'number' },
  { key: 'scredit',    label: 'Bonus inscription',   type: 'number' },
  { key: 'rcredit',    label: 'Bonus parrainage',    type: 'number' },
  { key: 'map_key',    label: 'Clé Google Maps',     type: 'text' },
  { key: 'agora_app_id', label: 'Agora App ID',      type: 'text' },
  { key: 'timezone',   label: 'Fuseau horaire',      type: 'text' },
];

export default function AdminSettings() {
  const { token, ready } = useAdminAuth();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const basUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lovmy.dontmove.app/api/v1/';
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!ready) return;
    setLoading(true);
    axios.get(`${basUrl}admin/settings`, { headers })
      .then((r) => setForm(r.data.data ?? {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [ready, token]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await axios.put(`${basUrl}admin/settings`, form, { headers });
      setMsg('Paramètres sauvegardés avec succès.');
    } catch {
      setMsg('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-400">Chargement…</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Paramètres</h1>

      <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-slate-700 bg-slate-800 p-6">
        {FIELDS.map(({ key, label, type }) => (
          <div key={key}>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">{label}</label>
            <input
              type={type}
              value={form[key] ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
            />
          </div>
        ))}

        {msg && (
          <p className={`rounded-xl px-4 py-3 text-sm border ${msg.includes('succès') ? 'bg-emerald-900/50 text-emerald-400 border-emerald-800' : 'bg-red-900/50 text-red-400 border-red-800'}`}>
            {msg}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60 transition"
        >
          {saving ? 'Sauvegarde…' : 'Sauvegarder'}
        </button>
      </form>
    </div>
  );
}
