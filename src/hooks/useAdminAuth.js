'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAdminAuth() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    const raw = localStorage.getItem('admin_user');
    if (!t || !raw) {
      router.replace('/admin/login');
      return;
    }
    try {
      setAdmin(JSON.parse(raw));
      setToken(t);
      setReady(true);
    } catch {
      router.replace('/admin/login');
    }
  }, [router]);

  const adminLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.replace('/admin/login');
  };

  return { admin, token, ready, adminLogout };
}
