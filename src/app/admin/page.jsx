'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminIndex() {
  const router = useRouter();
  const { ready } = useAdminAuth();

  useEffect(() => {
    if (ready) router.replace('/admin/dashboard');
  }, [ready, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-ember border-t-transparent" />
    </div>
  );
}
