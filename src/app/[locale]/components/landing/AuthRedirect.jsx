'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';

export default function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      router.replace('/dashboard');
    }
  }, [router]);

  return null;
}
