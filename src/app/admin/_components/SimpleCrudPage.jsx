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

  const basUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lovmy.dontmove.app/api/';
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
      <h1 className="font-serif text-2xl text-white">{title}</h1>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[var(--line)] bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold text-[var(--txt-soft)]">{editing ? 'Modifier' : 'Ajouter'}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map(({ key, label, type = 'text', required = true }) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium text-[var(--txt-faint)]">{label}</label>
              {type === 'select-status' ? (
                <select
                  value={form[key] ?? '1'}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full rounded-xl border border-[var(--line)] bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-ember"
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
                  className="w-full resize-none rounded-xl border border-[var(--line)] bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-ember"
                />
              ) : (
                <input
                  type={type}
                  value={form[key] ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  required={required}
                  className="w-full rounded-xl border border-[var(--line)] bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-ember"
                />
              )}
            </div>
          ))}
        </div>

        {msg && <p className="rounded-xl border border-ember/30 bg-ember/10 px-4 py-2 text-sm text-ember">{msg}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="group relative overflow-hidden rounded-xl bg-gradient-passion px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_34px_-10px_rgba(246,65,53,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-12px_rgba(235,6,3,0.45)] disabled:pointer-events-none disabled:opacity-60"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative">{saving ? 'Sauvegarde…' : editing ? 'Mettre à jour' : 'Ajouter'}</span>
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="rounded-xl border border-[var(--line)] px-5 py-2 text-sm text-[var(--txt-soft)] transition hover:bg-white/5">
              Annuler
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white/[0.03]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] text-left text-[var(--txt-faint)]">
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
              <tr><td colSpan={fields.length + 3} className="py-10 text-center text-[var(--txt-faint)]">Chargement…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={fields.length + 3} className="py-10 text-center text-[var(--txt-faint)]">Aucun élément</td></tr>
            ) : items.map((item) => (
              <tr key={item.id} className="border-b border-[var(--line)] hover:bg-white/[0.03]">
                <td className="px-4 py-3 text-xs text-[var(--txt-faint)]">{item.id}</td>
                {fields.filter(f => f.key !== 'status').map(({ key }) => (
                  <td key={key} className="max-w-xs truncate px-4 py-3 text-[var(--txt)]">{item[key] ?? '—'}</td>
                ))}
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${item.status == 1 ? 'bg-emerald-900/50 text-emerald-400' : 'bg-white/5 text-[var(--txt-faint)]'}`}>
                    {item.status == 1 ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {canEdit && (
                      <button onClick={() => startEdit(item)} className="rounded-lg border border-[var(--line)] px-3 py-1 text-xs text-[var(--txt-soft)] transition hover:bg-white/5">
                        Modifier
                      </button>
                    )}
                    <button onClick={() => handleDelete(item.id)} className="rounded-lg bg-ember/10 px-3 py-1 text-xs text-ember transition hover:bg-ember/20">
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
