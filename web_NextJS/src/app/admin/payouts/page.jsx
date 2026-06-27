'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminPayouts() {
  const { token, ready } = useAdminAuth();
  const [payouts, setPayouts] = useState([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const basUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lovmy.dontmove.app/api/v1/';
  const headers = { Authorization: `Bearer ${token}` };

  const fetchPayouts = (status = filter) => {
    if (!token) return;
    setLoading(true);
    axios.get(`${basUrl}admin/payouts`, { headers, params: status ? { status } : {} })
      .then((r) => { setPayouts(r.data.data); setTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (ready) fetchPayouts(); }, [ready, token]);

  const handleApprove = async (id, status) => {
    await axios.post(`${basUrl}admin/payouts/${id}/approve`, { id, status }, { headers });
    fetchPayouts();
  };

  const statusColor = (s) => {
    if (s === 'Approved') return 'bg-emerald-900/50 text-emerald-400';
    if (s === 'Rejected') return 'bg-red-900/50 text-red-400';
    return 'bg-amber-900/50 text-amber-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Retraits <span className="text-slate-400 text-base font-normal">({total})</span></h1>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); fetchPayouts(e.target.value); }}
          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white outline-none focus:border-violet-500"
        >
          <option value="">Tous</option>
          <option value="Pending">En attente</option>
          <option value="Approved">Approuvés</option>
          <option value="Rejected">Refusés</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-400">
              <th className="px-4 py-3 font-medium">Utilisateur</th>
              <th className="px-4 py-3 font-medium">Montant</th>
              <th className="px-4 py-3 font-medium">Coins</th>
              <th className="px-4 py-3 font-medium">Méthode</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center text-slate-500">Chargement…</td></tr>
            ) : payouts.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-slate-500">Aucun retrait</td></tr>
            ) : payouts.map((p) => (
              <tr key={p.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="px-4 py-3 text-white">{p.user?.name ?? `#${p.uid}`}</td>
                <td className="px-4 py-3 text-amber-400">{p.amount} €</td>
                <td className="px-4 py-3 text-slate-300">{p.coin}</td>
                <td className="px-4 py-3 text-slate-300">{p.payment_method ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(p.status)}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3">
                  {p.status === 'Pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(p.id, 'Approved')} className="rounded-lg bg-emerald-900/50 px-3 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-800 transition">
                        Approuver
                      </button>
                      <button onClick={() => handleApprove(p.id, 'Rejected')} className="rounded-lg bg-red-900/50 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-800 transition">
                        Refuser
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
