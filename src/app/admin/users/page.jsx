'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminUsers() {
  const { token, ready } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const basUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lovmy.dontmove.app/api/';
  const headers = { Authorization: `Bearer ${token}` };

  const fetchUsers = (q = search, p = page) => {
    if (!token) return;
    setLoading(true);
    axios.get(`${basUrl}admin/users`, { headers, params: { search: q, page: p } })
      .then((r) => { setUsers(r.data.data); setTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (ready) fetchUsers(); }, [ready, token]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(search, 1);
  };

  const toggleBan = async (user) => {
    const newStatus = user.status === 1 ? 0 : 1;
    await axios.post(`${basUrl}admin/users/${user.id}/ban`, { uid: user.id, status: newStatus }, { headers });
    fetchUsers();
  };

  const toggleVerify = async (user) => {
    const newVerify = user.is_verify === 1 ? 0 : 1;
    await axios.post(`${basUrl}admin/users/${user.id}/verify`, { uid: user.id, is_verify: newVerify }, { headers });
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl text-white">Utilisateurs <span className="text-base font-normal text-[var(--txt-faint)]">({total})</span></h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom…"
            className="rounded-xl border border-[var(--line)] bg-white/[0.03] px-4 py-2 text-sm text-white placeholder-[var(--txt-faint)] outline-none focus:border-ember"
          />
          <button type="submit" className="rounded-xl bg-gradient-passion px-4 py-2 text-sm font-medium text-white shadow-[0_10px_34px_-10px_rgba(246,65,53,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-12px_rgba(235,6,3,0.45)]">
            Chercher
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white/[0.03]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] text-left text-[var(--txt-faint)]">
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Mobile</th>
              <th className="px-4 py-3 font-medium">Genre</th>
              <th className="px-4 py-3 font-medium">Coins</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Vérifié</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center text-[var(--txt-faint)]">Chargement…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-[var(--txt-faint)]">Aucun utilisateur trouvé</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="border-b border-[var(--line)] hover:bg-white/[0.03]">
                <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                <td className="px-4 py-3 text-[var(--txt-soft)]">{u.mobile}</td>
                <td className="px-4 py-3 text-[var(--txt-soft)]">{u.gender}</td>
                <td className="px-4 py-3 text-amber-400">{u.coin}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.status === 1 ? 'bg-emerald-900/50 text-emerald-400' : 'bg-ember/10 text-ember'}`}>
                    {u.status === 1 ? 'Actif' : 'Banni'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.is_verify === 1 ? 'bg-sky-900/50 text-sky-400' : 'bg-white/5 text-[var(--txt-faint)]'}`}>
                    {u.is_verify === 1 ? 'Vérifié' : 'Non vérifié'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => toggleBan(u)} className={`rounded-lg px-3 py-1 text-xs font-medium transition ${u.status === 1 ? 'bg-ember/10 text-ember hover:bg-ember/20' : 'bg-emerald-900/50 text-emerald-400 hover:bg-emerald-800'}`}>
                      {u.status === 1 ? 'Bannir' : 'Activer'}
                    </button>
                    <button onClick={() => toggleVerify(u)} className="rounded-lg border border-[var(--line)] px-3 py-1 text-xs font-medium text-[var(--txt-soft)] transition hover:bg-white/5">
                      {u.is_verify === 1 ? 'Dévérifier' : 'Vérifier'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <button onClick={() => { setPage(p => Math.max(1, p - 1)); fetchUsers(search, Math.max(1, page - 1)); }} disabled={page === 1} className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm text-[var(--txt-soft)] transition hover:bg-white/5 disabled:opacity-40">
          Précédent
        </button>
        <span className="flex items-center px-4 text-sm text-[var(--txt-faint)]">Page {page}</span>
        <button onClick={() => { setPage(p => p + 1); fetchUsers(search, page + 1); }} disabled={users.length < 20} className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm text-[var(--txt-soft)] transition hover:bg-white/5 disabled:opacity-40">
          Suivant
        </button>
      </div>
    </div>
  );
}
