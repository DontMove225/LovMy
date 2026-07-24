'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const imageBaseURL = process.env.NEXT_PUBLIC_IMAGE_URL || 'https://lovmy.dontmove.app/';

const emptyForm = { title: '', link_url: '', start_date: '', end_date: '', status: '1' };

function computeBadge(ad) {
  const today = new Date().toISOString().slice(0, 10);
  if (String(ad.status) === '0' || ad.status === false) return { label: 'Désactivée', className: 'bg-white/5 text-[var(--txt-faint)]' };
  if (today < ad.start_date) return { label: 'Programmée', className: 'bg-[rgba(48,59,99,0.5)] text-[#8aa0d8]' };
  if (today > ad.end_date) return { label: 'Expirée', className: 'bg-white/5 text-[var(--txt-faint)]' };
  return { label: 'Active', className: 'bg-emerald-900/50 text-emerald-400' };
}

export default function AdminAds() {
  const { token, ready } = useAdminAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const basUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lovmy.dontmove.app/api/';
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAds = () => {
    if (!token) return;
    setLoading(true);
    axios.get(`${basUrl}admin/ads`, { headers })
      .then((r) => setItems(r.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (ready) fetchAds(); }, [ready, token]);

  const resetForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setEditing(null);
    setMsg('');
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!editing && !imageFile) {
      setMsg("Une image est requise pour créer une publicité.");
      return;
    }
    setSaving(true);
    setMsg('');

    const data = new FormData();
    data.append('title', form.title);
    data.append('link_url', form.link_url);
    data.append('start_date', form.start_date);
    data.append('end_date', form.end_date);
    data.append('status', form.status);
    if (imageFile) data.append('image', imageFile);

    try {
      if (editing) {
        await axios.post(`${basUrl}admin/ads/${editing.id}`, data, { headers });
      } else {
        await axios.post(`${basUrl}admin/ads`, data, { headers });
      }
      resetForm();
      fetchAds();
    } catch (err) {
      const errors = err.response?.data?.errors;
      setMsg(errors ? Object.values(errors).flat().join(' ') : 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette publicité ?')) return;
    await axios.delete(`${basUrl}admin/ads/${id}`, { headers });
    fetchAds();
  };

  const startEdit = (ad) => {
    setEditing(ad);
    setForm({
      title: ad.title || '',
      link_url: ad.link_url || '',
      start_date: ad.start_date,
      end_date: ad.end_date,
      status: ad.status ? '1' : '0',
    });
    setImageFile(null);
    setImagePreview(`${imageBaseURL}${ad.image}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const inputClass = 'w-full rounded-xl border border-[var(--line)] bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-ember';
  const labelClass = 'mb-1 block text-xs font-medium text-[var(--txt-faint)]';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-white">Publicités</h1>
        <p className="mt-1 text-sm text-[var(--txt-soft)]">
          Configure les visuels publicitaires affichés aux utilisateurs sous forme de modal, avec une période de diffusion.
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[var(--line)] bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold text-[var(--txt-soft)]">{editing ? 'Modifier la publicité' : 'Ajouter une publicité'}</h2>

        <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
          <div>
            <label className={labelClass}>Image {editing ? '' : '(requise)'}</label>
            <label className="flex aspect-[4/5] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-[var(--line)] bg-white/5 text-[var(--txt-faint)] transition hover:border-ember/40 hover:text-white">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Aperçu" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs">Choisir une image</span>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Titre (interne)</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Lien (optionnel, ouvert au clic)</label>
              <input
                type="url"
                placeholder="https://…"
                value={form.link_url}
                onChange={(e) => setForm((f) => ({ ...f, link_url: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Date de début</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Date de fin</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                required
                min={form.start_date || undefined}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Statut</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className={inputClass}
              >
                <option value="1">Actif</option>
                <option value="0">Inactif</option>
              </select>
            </div>
          </div>
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
      <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white/[0.03]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] text-left text-[var(--txt-faint)]">
              <th className="px-4 py-3 font-medium">Miniature</th>
              <th className="px-4 py-3 font-medium">Titre</th>
              <th className="px-4 py-3 font-medium">Période</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Vues / Clics</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-10 text-center text-[var(--txt-faint)]">Chargement…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="py-10 text-center text-[var(--txt-faint)]">Aucune publicité</td></tr>
            ) : items.map((ad) => {
              const badge = computeBadge(ad);
              return (
                <tr key={ad.id} className="border-b border-[var(--line)] hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${imageBaseURL}${ad.image}`} alt={ad.title} className="h-14 w-11 rounded-lg object-cover" />
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-[var(--txt)]">{ad.title}</td>
                  <td className="px-4 py-3 text-xs text-[var(--txt-faint)]">{ad.start_date} → {ad.end_date}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>{badge.label}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--txt-faint)]">{ad.view_count ?? 0} / {ad.click_count ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(ad)} className="rounded-lg border border-[var(--line)] px-3 py-1 text-xs text-[var(--txt-soft)] transition hover:bg-white/5">
                        Modifier
                      </button>
                      <button onClick={() => handleDelete(ad.id)} className="rounded-lg bg-ember/10 px-3 py-1 text-xs text-ember transition hover:bg-ember/20">
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
