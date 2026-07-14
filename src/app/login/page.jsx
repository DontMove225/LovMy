'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MyContext } from '@/context/MyProvider';
import axios from 'axios';

export default function LoginPage() {
  const { basUrl, login } = useContext(MyContext);
  const router = useRouter();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!mobile || !password) {
      setMessage('Veuillez renseigner votre identifiant et mot de passe.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${basUrl}user_login.php`, {
        mobile,
        ccode: '',
        password,
      });

      if (response.data.Result === 'true') {
        const userData = response.data.UserLogin ?? {};
        const authToken = response.data.token || `lovmy-${userData.id}-${Date.now()}`;
        login(userData, authToken);
        router.push('/dashboard');
      } else {
        setMessage(response.data.ResponseMsg || 'Échec de connexion. Vérifiez vos identifiants.');
      }
    } catch (error) {
      setMessage('Erreur réseau. Veuillez réessayer plus tard.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden bg-obsidian px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 78% 8%, rgba(235,6,3,.20), transparent 60%), radial-gradient(50% 40% at 12% 30%, rgba(48,59,99,.22), transparent 60%)',
        }}
      />
      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8 backdrop-blur-xl">
          <div className="mb-8 text-center">
            <h1 className="font-serif text-3xl text-white">Bienvenue sur LovMy</h1>
            <p className="mt-2 text-[var(--txt-soft)]">Connectez-vous pour continuer</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--txt-soft)]">
                Email ou numéro de téléphone
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full rounded-2xl border border-[var(--line)] bg-white/5 px-4 py-3 text-white outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/20"
                placeholder="Email ou mobile"
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
                className="w-full rounded-2xl border border-[var(--line)] bg-white/5 px-4 py-3 text-white outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/20"
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
              className="w-full rounded-2xl bg-gradient-passion px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(235,6,3,0.35)] transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion en cours…' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link href="/forgot-password" className="block text-sm text-blush hover:underline">
              Mot de passe oublié ?
            </Link>
            <p className="text-sm text-[var(--txt-soft)]">
              Pas encore de compte ?{' '}
              <Link href="/register" className="font-medium text-blush hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
