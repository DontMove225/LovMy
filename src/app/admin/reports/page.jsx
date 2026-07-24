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
    const basUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lovmy.dontmove.app/api/';
    axios.get(`${basUrl}admin/reports`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { setReports(r.data.data); setTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [ready, token]);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-white">Signalements <span className="text-base font-normal text-[var(--txt-faint)]">({total})</span></h1>

      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white/[0.03]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] text-left text-[var(--txt-faint)]">
              <th className="px-4 py-3 font-medium">Signalé par</th>
              <th className="px-4 py-3 font-medium">Contre</th>
              <th className="px-4 py-3 font-medium">Raison</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="py-12 text-center text-[var(--txt-faint)]">Chargement…</td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan={4} className="py-12 text-center text-[var(--txt-faint)]">Aucun signalement</td></tr>
            ) : reports.map((r) => (
              <tr key={r.id} className="border-b border-[var(--line)] hover:bg-white/[0.03]">
                <td className="px-4 py-3 text-white">{r.reporter?.name ?? `#${r.uid}`}</td>
                <td className="px-4 py-3 text-[var(--txt-soft)]">{r.reported?.name ?? `#${r.report_id}`}</td>
                <td className="px-4 py-3 text-[var(--txt-soft)]">{r.reason ?? '—'}</td>
                <td className="px-4 py-3 text-xs text-[var(--txt-faint)]">{r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
