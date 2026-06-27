'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminPayments() {
  const { token, ready } = useAdminAuth();
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ready) return;
    setLoading(true);
    const basUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lovmy.dontmove.app/api/v1/';
    axios.get(`${basUrl}admin/payments`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { setPayments(r.data.data); setTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [ready, token]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Paiements <span className="text-slate-400 text-base font-normal">({total})</span></h1>

      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-400">
              <th className="px-4 py-3 font-medium">Utilisateur</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Montant</th>
              <th className="px-4 py-3 font-medium">Méthode</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center text-slate-500">Chargement…</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-slate-500">Aucun paiement</td></tr>
            ) : payments.map((p) => (
              <tr key={p.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="px-4 py-3 text-white">{p.user?.name ?? `#${p.uid}`}</td>
                <td className="px-4 py-3 text-slate-300">{p.plan_name ?? '—'}</td>
                <td className="px-4 py-3 text-amber-400">{p.amount} €</td>
                <td className="px-4 py-3 text-slate-300">{p.payment_method ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.status === 'Success' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                    {p.status ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
