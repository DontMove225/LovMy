'use client';

import { useParams } from 'next/navigation';

export default function DetailPage() {
  const params = useParams();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-slate-900">Profil: {params.name}</h1>
        <p className="mt-4 text-slate-600">Page de profil dynamique pour &quot;{params.name}&quot;.</p>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-sm text-slate-600">Données de profil à intégrer plus tard depuis l’API.</p>
        </div>
      </div>
    </main>
  );
}
