'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('admin_token')) {
      router.replace('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setMessage('Veuillez renseigner identifiant et mot de passe.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const basUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lovmy.dontmove.app/api/';
      const res = await axios.post(`${basUrl}auth/admin/login`, { username, password });
      localStorage.setItem('admin_token', res.data.token);
      localStorage.setItem('admin_user', JSON.stringify(res.data.user));
      router.push('/admin/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.username?.[0];
      setMessage(msg || 'Identifiants invalides.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-obsidian px-4">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 78% 8%, rgba(235,6,3,.20), transparent 60%), radial-gradient(50% 40% at 12% 30%, rgba(48,59,99,.22), transparent 60%)',
        }}
      />
      <div className="relative w-full max-w-sm animate-rise">
        <div className="rounded-2xl border border-[var(--line)] bg-white/[0.03] p-8 backdrop-blur-xl">
          <div className="mb-8 text-center">
            <div className="relative mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-passion">
              <span className="absolute inset-0 rounded-xl bg-gradient-passion opacity-60 animate-halo" />
              <svg className="relative h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="font-serif text-2xl text-white">LovMy Admin</h1>
            <p className="mt-1 text-sm text-[var(--txt-soft)]">Accès réservé aux administrateurs</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--txt-soft)]">
                Identifiant
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-[var(--line)] bg-white/5 px-4 py-3 text-white placeholder-[var(--txt-faint)] outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/20"
                placeholder="admin"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--txt-soft)]">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[var(--line)] bg-white/5 px-4 py-3 text-white placeholder-[var(--txt-faint)] outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/20"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {message && (
              <p className="rounded-xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-ember">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-passion px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_34px_-10px_rgba(246,65,53,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-12px_rgba(235,6,3,0.45)] disabled:pointer-events-none disabled:opacity-60"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">{loading ? 'Connexion…' : 'Se connecter'}</span>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
