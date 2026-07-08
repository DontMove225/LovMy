'use client';

import { useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminNotifications() {
  const { token, ready } = useAdminAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uid, setUid] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      setMsg('Titre et message sont requis.');
      return;
    }
    setSending(true);
    setMsg('');
    try {
      const basUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lovmy.dontmove.app/api/';
      const payload = { title, description };
      if (uid) payload.uid = parseInt(uid, 10);
      await axios.post(`${basUrl}admin/notifications`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsg(uid ? 'Notification envoyée à l\'utilisateur.' : 'Notification envoyée à tous les utilisateurs.');
      setTitle('');
      setDescription('');
      setUid('');
    } catch {
      setMsg('Erreur lors de l\'envoi.');
    } finally {
      setSending(false);
    }
  };

  if (!ready) return null;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-serif text-2xl text-white">Envoyer une notification</h1>

      <form onSubmit={handleSend} className="space-y-4 rounded-2xl border border-[var(--line)] bg-white/[0.03] p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--txt-soft)]">Titre</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de la notification"
            className="w-full rounded-xl border border-[var(--line)] bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-ember"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--txt-soft)]">Message</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contenu de la notification…"
            className="w-full resize-none rounded-xl border border-[var(--line)] bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-ember"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--txt-soft)]">
            ID utilisateur <span className="font-normal text-[var(--txt-faint)]">(laisser vide pour envoyer à tous)</span>
          </label>
          <input
            type="number"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            placeholder="ex: 42"
            className="w-full rounded-xl border border-[var(--line)] bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-ember"
          />
        </div>

        {msg && (
          <p className={`rounded-xl border px-4 py-3 text-sm ${msg.includes('Erreur') ? 'border-ember/30 bg-ember/10 text-ember' : 'border-emerald-800 bg-emerald-900/50 text-emerald-400'}`}>
            {msg}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="rounded-xl bg-gradient-passion px-6 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(235,6,3,0.35)] transition hover:brightness-110 disabled:opacity-60"
        >
          {sending ? 'Envoi…' : uid ? 'Envoyer à cet utilisateur' : 'Envoyer à tous'}
        </button>
      </form>
    </div>
  );
}
