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

  const basUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lovmy.dontmove.app/api/v1/';
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
        <h1 className="text-2xl font-bold text-white">Utilisateurs <span className="text-slate-400 text-base font-normal">({total})</span></h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom…"
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500"
          />
          <button type="submit" className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">
            Chercher
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-400">
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
              <tr><td colSpan={7} className="py-12 text-center text-slate-500">Chargement…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-slate-500">Aucun utilisateur trouvé</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                <td className="px-4 py-3 text-slate-300">{u.mobile}</td>
                <td className="px-4 py-3 text-slate-300">{u.gender}</td>
                <td className="px-4 py-3 text-amber-400">{u.coin}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.status === 1 ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
                    {u.status === 1 ? 'Actif' : 'Banni'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.is_verify === 1 ? 'bg-sky-900/50 text-sky-400' : 'bg-slate-700 text-slate-400'}`}>
                    {u.is_verify === 1 ? 'Vérifié' : 'Non vérifié'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => toggleBan(u)} className={`rounded-lg px-3 py-1 text-xs font-medium transition ${u.status === 1 ? 'bg-red-900/50 text-red-400 hover:bg-red-800' : 'bg-emerald-900/50 text-emerald-400 hover:bg-emerald-800'}`}>
                      {u.status === 1 ? 'Bannir' : 'Activer'}
                    </button>
                    <button onClick={() => toggleVerify(u)} className="rounded-lg bg-slate-700 px-3 py-1 text-xs font-medium text-slate-300 hover:bg-slate-600 transition">
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
        <button onClick={() => { setPage(p => Math.max(1, p - 1)); fetchUsers(search, Math.max(1, page - 1)); }} disabled={page === 1} className="rounded-xl bg-slate-800 px-4 py-2 text-sm text-slate-300 disabled:opacity-40 hover:bg-slate-700">
          Précédent
        </button>
        <span className="flex items-center px-4 text-sm text-slate-400">Page {page}</span>
        <button onClick={() => { setPage(p => p + 1); fetchUsers(search, page + 1); }} disabled={users.length < 20} className="rounded-xl bg-slate-800 px-4 py-2 text-sm text-slate-300 disabled:opacity-40 hover:bg-slate-700">
          Suivant
        </button>
      </div>
    </div>
  );
}
