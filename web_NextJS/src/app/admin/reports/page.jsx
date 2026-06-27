'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminReports() {
  const { token, ready } = useAdminAuth();
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ready) return;
    setLoading(true);
    const basUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lovmy.dontmove.app/api/v1/';
    axios.get(`${basUrl}admin/reports`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { setReports(r.data.data); setTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [ready, token]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Signalements <span className="text-slate-400 text-base font-normal">({total})</span></h1>

      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-400">
              <th className="px-4 py-3 font-medium">Signalé par</th>
              <th className="px-4 py-3 font-medium">Contre</th>
              <th className="px-4 py-3 font-medium">Raison</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="py-12 text-center text-slate-500">Chargement…</td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan={4} className="py-12 text-center text-slate-500">Aucun signalement</td></tr>
            ) : reports.map((r) => (
              <tr key={r.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="px-4 py-3 text-white">{r.reporter?.name ?? `#${r.uid}`}</td>
                <td className="px-4 py-3 text-slate-300">{r.reported?.name ?? `#${r.report_id}`}</td>
                <td className="px-4 py-3 text-slate-300">{r.reason ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
