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
      const basUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lovmy.dontmove.app/api/v1/';
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
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold text-white">Envoyer une notification</h1>

      <form onSubmit={handleSend} className="space-y-4 rounded-2xl border border-slate-700 bg-slate-800 p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Titre</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de la notification"
            className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Message</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contenu de la notification…"
            className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500 resize-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            ID utilisateur <span className="text-slate-500 font-normal">(laisser vide pour envoyer à tous)</span>
          </label>
          <input
            type="number"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            placeholder="ex: 42"
            className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
          />
        </div>

        {msg && (
          <p className={`rounded-xl px-4 py-3 text-sm border ${msg.includes('Erreur') ? 'bg-red-900/50 text-red-400 border-red-800' : 'bg-emerald-900/50 text-emerald-400 border-emerald-800'}`}>
            {msg}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60 transition"
        >
          {sending ? 'Envoi…' : uid ? 'Envoyer à cet utilisateur' : 'Envoyer à tous'}
        </button>
      </form>
    </div>
  );
}
