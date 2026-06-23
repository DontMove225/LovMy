'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ValidatePage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      if (!host) {
        router.replace('/');
      }
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-xl text-center">
        <h1 className="text-3xl font-semibold text-slate-900">Validation</h1>
        <p className="mt-4 text-slate-600">Cette page gérera le contrôle de domaine et de licence.</p>
      </div>
    </main>
  );
}
