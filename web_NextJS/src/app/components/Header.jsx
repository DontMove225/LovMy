'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { label: 'Accueil', href: '/dashboard' },
  { label: 'Explorer', href: '/explore' },
  { label: 'Notifications', href: '/notification' },
  { label: 'Profil', href: '/profile' },
  { label: 'Wallet', href: '/wallet' },
  { label: 'Premium', href: '/upgrade' },
];

export default function Header() {
  const [isLogged, setIsLogged] = useState(false);
  const [userName, setUserName] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      setIsLogged(Boolean(token));
      if (token) {
        try {
          const user = JSON.parse(localStorage.getItem('Register_User') || '{}');
          setUserName(user.name || '');
        } catch {}
      }
    }
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('UserId');
      localStorage.removeItem('Register_User');
      router.push('/login');
    }
  };

  if (!isLogged) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-2xl font-bold text-violet-600 tracking-tight">
            LovMy
          </Link>
          <nav className="hidden gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                  pathname === item.href
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {userName && (
            <span className="hidden text-sm text-slate-600 sm:block">
              Bonjour, <span className="font-medium text-slate-900">{userName}</span>
            </span>
          )}
          <button
            onClick={handleLogout}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:border-red-200 hover:text-red-600"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}
