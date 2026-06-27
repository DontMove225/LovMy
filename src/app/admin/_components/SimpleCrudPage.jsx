'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '@/hooks/useAdminAuth';

/**
 * Page CRUD générique pour les ressources simples (titre + statut).
 * Props:
 *   title       — titre de la page
 *   endpoint    — ex: "admin/interests"
 *   fields      — [{ key, label, type?, required? }]
 *   canEdit     — boolean (false = seulement add/delete)
 */
const defaultForm = (fields) =>
  Object.fromEntries(fields.map(({ key, type }) => [key, type === 'select-status' ? '1' : '']));

export default function SimpleCrudPage({ title, endpoint, fields, canEdit = false }) {
  const { token, ready } = useAdminAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(() => defaultForm(fields));
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const basUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lovmy.dontmove.app/api/v1/';
  const headers = { Authorization: `Bearer ${token}` };

  const fetch = () => {
    if (!token) return;
    setLoading(true);
    axios.get(`${basUrl}${endpoint}`, { headers })
      .then((r) => setItems(r.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (ready) fetch(); }, [ready, token]);

  const resetForm = () => { setForm(defaultForm(fields)); setEditing(null); setMsg(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      if (editing) {
        await axios.put(`${basUrl}${endpoint}/${editing.id}`, form, { headers });
      } else {
        await axios.post(`${basUrl}${endpoint}`, form, { headers });
      }
      resetForm();
      fetch();
    } catch (err) {
      const errors = err.response?.data?.errors;
      setMsg(errors ? Object.values(errors).flat().join(' ') : 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet élément ?')) return;
    await axios.delete(`${basUrl}${endpoint}/${id}`, { headers });
    fetch();
  };

  const startEdit = (item) => {
    setEditing(item);
    const f = {};
    fields.forEach(({ key }) => { f[key] = item[key] ?? ''; });
    setForm(f);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">{title}</h1>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-700 bg-slate-800 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-300">{editing ? 'Modifier' : 'Ajouter'}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map(({ key, label, type = 'text', required = true }) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium text-slate-400">{label}</label>
              {type === 'select-status' ? (
                <select
                  value={form[key] ?? '1'}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full rounded-xl border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
                >
                  <option value="1">Actif</option>
                  <option value="0">Inactif</option>
                </select>
              ) : type === 'textarea' ? (
                <textarea
                  rows={3}
                  value={form[key] ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  required={required}
                  className="w-full rounded-xl border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-violet-500 resize-none"
                />
              ) : (
                <input
                  type={type}
                  value={form[key] ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  required={required}
                  className="w-full rounded-xl border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
                />
              )}
            </div>
          ))}
        </div>

        {msg && <p className="rounded-xl bg-red-900/50 px-4 py-2 text-sm text-red-400 border border-red-800">{msg}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60 transition">
            {saving ? 'Sauvegarde…' : editing ? 'Mettre à jour' : 'Ajouter'}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="rounded-xl bg-slate-700 px-5 py-2 text-sm text-slate-300 hover:bg-slate-600 transition">
              Annuler
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-400">
              <th className="px-4 py-3 font-medium">#</th>
              {fields.filter(f => f.key !== 'status').map(({ label, key }) => (
                <th key={key} className="px-4 py-3 font-medium">{label}</th>
              ))}
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={fields.length + 3} className="py-10 text-center text-slate-500">Chargement…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={fields.length + 3} className="py-10 text-center text-slate-500">Aucun élément</td></tr>
            ) : items.map((item) => (
              <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="px-4 py-3 text-slate-500 text-xs">{item.id}</td>
                {fields.filter(f => f.key !== 'status').map(({ key }) => (
                  <td key={key} className="px-4 py-3 text-slate-200 max-w-xs truncate">{item[key] ?? '—'}</td>
                ))}
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${item.status == 1 ? 'bg-emerald-900/50 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                    {item.status == 1 ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {canEdit && (
                      <button onClick={() => startEdit(item)} className="rounded-lg bg-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-600 transition">
                        Modifier
                      </button>
                    )}
                    <button onClick={() => handleDelete(item.id)} className="rounded-lg bg-red-900/50 px-3 py-1 text-xs text-red-400 hover:bg-red-800 transition">
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
