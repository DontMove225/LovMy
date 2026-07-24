'use client';

import { useContext, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import {
  FiHome, FiCompass, FiMessageCircle, FiBell,
  FiCreditCard, FiDollarSign, FiSettings, FiLogOut, FiMenu,
  FiShield, FiSlash, FiFileText, FiMail, FiLock, FiCheckCircle, FiEdit2, FiStar,
} from 'react-icons/fi';
import LanguageSwitcher from './LanguageSwitcher';
import AdModal from '@/components/ui/AdModal';
import { MyContext } from '@/context/MyProvider';

function parseJsonArray(raw) {
  try {
    const arr = JSON.parse(raw || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function profileCompletion(user) {
  if (!user) return 0;
  const checks = [
    Boolean(user.profile_pic),
    parseJsonArray(user.other_pic).length > 0,
    Boolean(user.profile_bio),
    Boolean(user.birth_date),
    parseJsonArray(user.interest).length > 0,
    parseJsonArray(user.language).length > 0,
    Boolean(user.height),
    Number(user.religion) > 0,
    Number(user.relation_goal) > 0,
    Boolean(user.gender),
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

function LogoMark({ size = 28 }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden drop-shadow-[0_4px_10px_rgba(235,6,3,0.35)]"
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo-lovmy.png"
        alt="LovMy"
        fill
        className="scale-[1.45] object-cover"
        style={{ objectPosition: '50% 54%' }}
        priority
      />
    </div>
  );
}

export default function AppShell({ children }) {
  const t = useTranslations('Nav');
  const { unreadCount, refreshUnreadCount, apiPost, imageBaseURL } = useContext(MyContext);
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: '/dashboard', label: t('home'), icon: FiHome },
    { href: '/explore', label: t('discover'), icon: FiCompass },
    { href: '/settings', label: t('settings'), icon: FiSettings },
    { href: '/wallet', label: t('wallet'), icon: FiCreditCard },
    { href: '/buyCoin', label: t('buyCoins'), icon: FiDollarSign },
    { href: '/account-security', label: t('accountSecurity'), icon: FiLock },
    { href: '/chat', label: t('messages'), icon: FiMessageCircle },
    { href: '/pages/3', label: t('privacy'), icon: FiShield },
    { href: '/pages/2', label: t('terms'), icon: FiFileText },
    { href: '/contact', label: t('contact'), icon: FiMail },
    { href: '/pages/5', label: t('safety'), icon: FiSlash },
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    setIsLogged(Boolean(token));
    if (token) {
      try {
        setUser(JSON.parse(localStorage.getItem('Register_User') || '{}'));
      } catch {
        setUser(null);
      }
    }
  }, [pathname]);

  useEffect(() => {
    if (!isLogged) return undefined;
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isLogged, refreshUnreadCount]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('UserId');
    localStorage.removeItem('Register_User');
    router.push('/login');
  };

  if (!isLogged) return <>{children}</>;

  const completion = profileCompletion(user);

  const renderLink = ({ href, label, icon: Icon }) => {
    const active = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        onClick={() => setSidebarOpen(false)}
        title={collapsed ? label : undefined}
        className={`group relative flex items-center gap-3.5 rounded-xl px-4 py-1.5 text-base font-medium transition ${
          collapsed ? 'justify-center' : ''
        } ${
          active
            ? 'bg-gradient-passion text-white shadow-[0_6px_18px_rgba(235,6,3,0.35)]'
            : 'text-[var(--txt-soft)] hover:bg-white/5 hover:text-white'
        }`}
      >
        <Icon className="h-5 w-5 shrink-0 stroke-[1.6]" />
        {!collapsed && <span className="min-w-0 truncate">{label}</span>}

        {collapsed && (
          <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-[var(--line)] bg-obsidian px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-opacity duration-150 group-hover:opacity-100">
            {label}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-obsidian">
      <AdModal apiPost={apiPost} imageBaseURL={imageBaseURL} />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[var(--line)] bg-obsidian transition-all duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:w-20' : 'w-72'}`}
      >
        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-4 top-6 z-10 hidden h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-obsidian text-[var(--txt-soft)] shadow-[0_6px_18px_rgba(0,0,0,0.4)] transition hover:border-ember/40 hover:text-white lg:flex"
          aria-label={collapsed ? 'Développer le menu' : 'Réduire le menu'}
        >
          <FiMenu className="h-5 w-5" />
        </button>

        <div className={`flex h-12 items-center border-b border-[var(--line)] ${collapsed ? 'justify-center px-2' : 'gap-2 px-6'}`}>
          <Link href="/dashboard" className="flex items-center gap-2 font-serif text-xl text-white">
            <LogoMark size={collapsed ? 28 : 26} />
            {!collapsed && <>Lov<em className="italic text-ember">My</em></>}
          </Link>
        </div>

        <div className={`flex items-center border-b border-[var(--line)] py-2 ${collapsed ? 'justify-center px-2' : 'gap-3 px-4'}`}>
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
            <span className="absolute inset-0 animate-halo rounded-full bg-gradient-passion opacity-40 blur-md" />
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--line)] bg-gradient-passion font-serif text-sm text-white">
              {user?.profile_pic ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${process.env.NEXT_PUBLIC_IMAGE_URL || ''}${user.profile_pic}`}
                  alt={user?.name || ''}
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.name?.[0]?.toUpperCase() ?? 'U'
              )}
            </div>
            {!collapsed && completion > 0 && (
              <span className="absolute -bottom-1 -right-1 rounded-full border-2 border-obsidian bg-passion px-1 py-px font-mono text-[8px] font-bold text-white">
                {completion}%
              </span>
            )}
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 truncate text-sm font-semibold text-white">
                {user?.name || t('defaultUser')}
                {user?.is_verify ? <FiCheckCircle className="h-3 w-3 shrink-0 text-ember" /> : null}
              </p>
              <p className="truncate text-[11px] text-[var(--txt-faint)]">{user?.email || user?.mobile || ''}</p>
            </div>
          )}

          {!collapsed && (
            <Link
              href="/profile"
              className="flex shrink-0 items-center gap-1 rounded-full bg-gradient-passion px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-wide text-white shadow-[0_6px_18px_rgba(235,6,3,0.35)] transition hover:brightness-110"
            >
              <FiEdit2 className="h-2.5 w-2.5" /> {t('edit')}
            </Link>
          )}
        </div>

        <nav className={`no-scrollbar flex min-h-0 flex-col overflow-y-auto py-2 ${collapsed ? 'gap-1.5 overflow-x-visible px-2' : 'gap-0.5 px-4'}`}>
          {navItems.map(renderLink)}
        </nav>

        <div className={`border-t border-[var(--line)] p-2 ${collapsed ? 'px-2' : ''}`}>
          <button
            onClick={handleLogout}
            title={collapsed ? t('logout') : undefined}
            className="group relative flex w-full items-center justify-center gap-3.5 rounded-xl px-4 py-1.5 text-base text-[var(--txt-soft)] transition hover:bg-ember/10 hover:text-ember"
          >
            <FiLogOut className="h-5 w-5" />
            {!collapsed && t('logout')}

            {collapsed && (
              <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-[var(--line)] bg-obsidian px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-opacity duration-150 group-hover:opacity-100">
                {t('logout')}
              </span>
            )}
          </button>
        </div>

        {/* Absorbs any leftover height at the very bottom instead of leaving a
            gap between the last menu item and Log out. */}
        <div className="flex-1" />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[var(--line)] bg-obsidian/95 px-6 backdrop-blur-xl">
          <button
            className="text-[var(--txt-soft)] hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu className="h-6 w-6" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 font-serif text-xl text-white lg:hidden">
            <LogoMark size={24} />
            Lov<em className="italic text-ember">My</em>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/notification"
              className="relative rounded-full p-2 text-[var(--txt-soft)] transition hover:bg-white/5 hover:text-white"
            >
              <FiBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-passion px-1 font-mono text-[9px] font-semibold leading-none text-white shadow-[0_0_8px_rgba(235,6,3,0.6)] animate-halo">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/upgrade"
              className="flex items-center gap-1.5 rounded-full bg-gradient-passion px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-white shadow-[0_6px_18px_rgba(235,6,3,0.35)] transition hover:brightness-110"
            >
              {user?.is_subscribe && user?.plan?.title ? (
                <>
                  <FiStar className="h-3.5 w-3.5" /> {user.plan.title}
                </>
              ) : (
                t('premium')
              )}
            </Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
