'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MyContext } from '@/context/MyProvider';
import axios from 'axios';

export const metadata = {
  title: 'Connexion',
};

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
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gradient-to-br from-violet-50 to-slate-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900">Bienvenue sur LovMy</h1>
            <p className="mt-2 text-slate-500">Connectez-vous pour continuer</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email ou numéro de téléphone
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                placeholder="Email ou mobile"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {message && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion en cours…' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <a href="/phonenumber" className="block text-sm text-violet-600 hover:underline">
              Mot de passe oublié ?
            </a>
            <p className="text-sm text-slate-500">
              Pas encore de compte ?{' '}
              <a href="/register" className="font-medium text-violet-600 hover:underline">
                Créer un compte
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
