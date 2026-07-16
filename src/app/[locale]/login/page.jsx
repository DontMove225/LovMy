'use client';

import { useContext, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { MyContext } from '@/context/MyProvider';
import SocialLoginButtons from '@/app/[locale]/components/SocialLoginButtons';
import axios from 'axios';

export default function LoginPage() {
  const t = useTranslations('Login');
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
      setMessage(t('errorRequired'));
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
        setMessage(response.data.ResponseMsg || t('errorGeneric'));
      }
    } catch (error) {
      setMessage(t('errorNetwork'));
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
            <h1 className="font-serif text-3xl text-white">{t('title')}</h1>
            <p className="mt-2 text-[var(--txt-soft)]">{t('subtitle')}</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--txt-soft)]">
                {t('emailOrPhone')}
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full rounded-2xl border border-[var(--line)] bg-white/5 px-4 py-3 text-white outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/20"
                placeholder={t('emailOrPhonePlaceholder')}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--txt-soft)]">
                {t('password')}
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
              {loading ? t('submitLoading') : t('submit')}
            </button>
          </form>

          <div className="mt-6">
            <SocialLoginButtons onError={setMessage} />
          </div>

          <div className="mt-6 text-center space-y-2">
            <Link href="/forgot-password" className="block text-sm text-blush hover:underline">
              {t('forgotPassword')}
            </Link>
            <p className="text-sm text-[var(--txt-soft)]">
              {t('noAccount')}{' '}
              <Link href="/register" className="font-medium text-blush hover:underline">
                {t('createAccount')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
