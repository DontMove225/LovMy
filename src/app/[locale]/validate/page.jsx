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
    <main className="min-h-screen bg-obsidian px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8 text-center">
        <h1 className="font-serif text-3xl text-white">Validation</h1>
        <p className="mt-4 text-[var(--txt-soft)]">Cette page gérera le contrôle de domaine et de licence.</p>
      </div>
    </main>
  );
}
