'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiHome, FiCompass, FiMessageCircle, FiBell, FiUser,
  FiCreditCard, FiDollarSign, FiStar, FiSettings, FiLogOut, FiMenu,
} from 'react-icons/fi';

const navItems = [
  { href: '/dashboard', label: 'Accueil', icon: FiHome },
  { href: '/explore', label: 'Découverte', icon: FiCompass },
  { href: '/chat', label: 'Messages', icon: FiMessageCircle },
  { href: '/notification', label: 'Notifications', icon: FiBell },
  { href: '/wallet', label: 'Wallet', icon: FiCreditCard },
  { href: '/upgrade', label: 'Premium', icon: FiStar },
];

const accountItems = [
  { href: '/profile', label: 'Mon profil', icon: FiUser },
  { href: '/buyCoin', label: 'Acheter des coins', icon: FiDollarSign },
  { href: '/settings', label: 'Paramètres & confidentialité', icon: FiSettings },
];

export default function AppShell({ children }) {
  const [isLogged, setIsLogged] = useState(false);
  const [userName, setUserName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    setIsLogged(Boolean(token));
    if (token) {
      try {
        const user = JSON.parse(localStorage.getItem('Register_User') || '{}');
        setUserName(user.name || '');
      } catch {}
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('UserId');
    localStorage.removeItem('Register_User');
    router.push('/login');
  };

  if (!isLogged) return <>{children}</>;

  const renderLink = ({ href, label, icon: Icon }) => {
    const active = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
          active
            ? 'bg-gradient-passion text-white shadow-[0_6px_18px_rgba(235,6,3,0.35)]'
            : 'text-[var(--txt-soft)] hover:bg-white/5 hover:text-white'
        }`}
      >
        <Icon className="h-[18px] w-[18px] shrink-0 stroke-[1.6]" />
        {label}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-obsidian">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[var(--line)] bg-obsidian transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center border-b border-[var(--line)] px-6">
          <Link href="/dashboard" className="font-serif text-2xl text-white">
            Lov<em className="italic text-ember">My</em>
          </Link>
        </div>

        <div className="flex items-center gap-3 border-b border-[var(--line)] px-6 py-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-passion text-sm font-bold text-white">
            {userName?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{userName || 'Utilisateur'}</p>
            <Link href="/profile" className="text-xs text-blush hover:underline">
              Modifier le profil
            </Link>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {navItems.map(renderLink)}

          <p className="mb-1 mt-6 px-3 font-mono text-[10px] uppercase tracking-widest text-[var(--txt-faint)]">
            Compte
          </p>
          {accountItems.map(renderLink)}
        </nav>

        <div className="border-t border-[var(--line)] p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--txt-soft)] transition hover:bg-ember/10 hover:text-ember"
          >
            <FiLogOut className="h-[18px] w-[18px]" />
            Déconnexion
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[var(--line)] bg-obsidian/95 px-6 backdrop-blur-xl">
          <button
            className="text-[var(--txt-soft)] hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu className="h-6 w-6" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/notification"
              className="rounded-full p-2 text-[var(--txt-soft)] transition hover:bg-white/5 hover:text-white"
            >
              <FiBell className="h-5 w-5" />
            </Link>
            <Link
              href="/upgrade"
              className="rounded-full bg-gradient-passion px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-white shadow-[0_6px_18px_rgba(235,6,3,0.35)] transition hover:brightness-110"
            >
              Premium
            </Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
