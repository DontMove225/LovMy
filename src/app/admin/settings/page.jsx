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
  { key: 'timezone',   label: 'Fuseau horaire',      type: 'text' },
];

export default function AdminSettings() {
  const { token, ready } = useAdminAuth();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const basUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lovmy.dontmove.app/api/';
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
    } catch (error) {
      const status = error.response?.status;
      const serverMsg = error.response?.data?.ResponseMsg || error.response?.data?.message;
      if (!error.response) {
        setMsg('Erreur réseau : impossible de joindre le serveur backend (vérifiez qu\'il est bien lancé).');
      } else if (status === 401) {
        setMsg('Session admin expirée, veuillez vous reconnecter.');
      } else {
        setMsg(`Erreur lors de la sauvegarde${status ? ` (${status})` : ''}${serverMsg ? ` : ${serverMsg}` : ''}.`);
      }
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-[var(--txt-soft)]">Chargement…</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-serif text-2xl text-white">Communication</h1>

      <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-[var(--line)] bg-white/[0.03] p-6">
        {FIELDS.map(({ key, label, type }) => (
          <div key={key}>
            <label className="mb-1.5 block text-sm font-medium text-[var(--txt-soft)]">{label}</label>
            <input
              type={type}
              value={form[key] ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="w-full rounded-xl border border-[var(--line)] bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-ember"
            />
          </div>
        ))}

        {msg && (
          <p className={`rounded-xl border px-4 py-3 text-sm ${msg.includes('succès') ? 'border-emerald-800 bg-emerald-900/50 text-emerald-400' : 'border-ember/30 bg-ember/10 text-ember'}`}>
            {msg}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-gradient-passion px-6 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(235,6,3,0.35)] transition hover:brightness-110 disabled:opacity-60"
        >
          {saving ? 'Sauvegarde…' : 'Sauvegarder'}
        </button>
      </form>
    </div>
  );
}
