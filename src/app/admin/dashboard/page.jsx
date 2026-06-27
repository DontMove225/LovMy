'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const StatCard = ({ label, value, color = 'text-white' }) => (
  <div className="rounded-2xl bg-slate-800 border border-slate-700 p-5">
    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
    <p className={`mt-2 text-3xl font-bold ${color}`}>
      {value ?? <span className="inline-block h-8 w-20 animate-pulse rounded-lg bg-slate-700" />}
    </p>
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">{children}</h2>
);

export default function AdminDashboard() {
  const { token, ready } = useAdminAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!ready) return;
    const basUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lovmy.dontmove.app/api/v1/';
    axios
      .get(`${basUrl}admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setData(r.data.data))
      .catch(console.error);
  }, [ready, token]);

  const fmt = (v) => (v != null ? v : undefined);
  const money = (v) => (v != null ? `${Number(v).toLocaleString('fr-FR')} €` : undefined);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      {/* Utilisateurs */}
      <div className="space-y-3">
        <SectionTitle>Utilisateurs</SectionTitle>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total utilisateurs"   value={fmt(data?.total_users)}       color="text-violet-400" />
          <StatCard label="Hommes"               value={fmt(data?.total_male)}         color="text-sky-400" />
          <StatCard label="Femmes"               value={fmt(data?.total_female)}       color="text-pink-400" />
          <StatCard label="Faux profils"         value={fmt(data?.total_fake_users)}   color="text-slate-400" />
          <StatCard label="Abonnés"              value={fmt(data?.total_subscribers)}  color="text-emerald-400" />
          <StatCard label="Nouveaux aujourd'hui" value={fmt(data?.new_users_today)}    color="text-amber-400" />
          <StatCard label="Signalements ouverts" value={fmt(data?.pending_reports)}    color="text-red-400" />
          <StatCard label="Retraits en attente"  value={fmt(data?.pending_payouts)}    color="text-orange-400" />
        </div>
      </div>

      {/* Revenus */}
      <div className="space-y-3">
        <SectionTitle>Revenus</SectionTitle>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Gain total" value={money(data?.total_revenue)} color="text-emerald-400" />
          <StatCard label="Plans"      value={fmt(data?.total_plans)}     color="text-slate-300" />
          <StatCard label="Packages"   value={fmt(data?.total_packages)}  color="text-slate-300" />
          <StatCard label="Cadeaux"    value={fmt(data?.total_gifts)}     color="text-slate-300" />
        </div>
      </div>

      {/* Contenu */}
      <div className="space-y-3">
        <SectionTitle>Contenu</SectionTitle>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Intérêts"             value={fmt(data?.total_interests)} />
          <StatCard label="Langues"              value={fmt(data?.total_languages)} />
          <StatCard label="Religions"            value={fmt(data?.total_religions)} />
          <StatCard label="Objectifs relation."  value={fmt(data?.total_goals)} />
          <StatCard label="FAQ"                  value={fmt(data?.total_faqs)} />
          <StatCard label="Pages"                value={fmt(data?.total_pages)} />
        </div>
      </div>
    </div>
  );
}
