'use client';

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import Script from 'next/script';
import axios from 'axios';
import { MyContext } from '@/context/MyProvider';

export default function SocialLoginButtons({ onError }) {
  const t = useTranslations('SocialLogin');
  const { basUrl, login } = useContext(MyContext);
  const router = useRouter();
  const googleButtonRef = useRef(null);

  const [settings, setSettings] = useState(null);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  const [facebookScriptLoaded, setFacebookScriptLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    axios
      .get(`${basUrl}sms_type.php`)
      .then((response) => {
        if (cancelled) return;
        setSettings({
          enabled: response.data.Social_login_enabled === 'Yes',
          googleClientId: response.data.google_client_id || '',
          facebookAppId: response.data.facebook_app_id || '',
        });
      })
      .catch(() => {
        if (!cancelled) setSettings({ enabled: false, googleClientId: '', facebookAppId: '' });
      });

    return () => {
      cancelled = true;
    };
  }, [basUrl]);

  const completeLogin = useCallback(
    async (provider, token) => {
      setLoading(true);
      try {
        const response = await axios.post(`${basUrl}auth/social`, { provider, token });

        if (response.data.Result === 'true') {
          const userData = response.data.UserLogin ?? {};
          login(userData, response.data.token);
          router.push('/dashboard');
        } else {
          onError?.(response.data.ResponseMsg || t('errorGeneric'));
        }
      } catch (error) {
        onError?.(t('errorNetwork'));
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [basUrl, login, router, onError, t]
  );

  const handleGoogleCredential = useCallback(
    (response) => {
      if (response?.credential) {
        completeLogin('google', response.credential);
      }
    },
    [completeLogin]
  );

  useEffect(() => {
    if (!googleScriptLoaded || !settings?.googleClientId || !googleButtonRef.current) return;
    if (!window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: settings.googleClientId,
      callback: handleGoogleCredential,
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: 'filled_black',
      size: 'large',
      width: 336,
      shape: 'pill',
    });
  }, [googleScriptLoaded, settings, handleGoogleCredential]);

  useEffect(() => {
    if (!facebookScriptLoaded || !settings?.facebookAppId || !window.FB) return;

    window.FB.init({
      appId: settings.facebookAppId,
      cookie: true,
      xfbml: false,
      version: 'v19.0',
    });
  }, [facebookScriptLoaded, settings]);

  const handleFacebookLogin = () => {
    if (!window.FB) return;

    window.FB.login(
      (response) => {
        if (response?.authResponse?.accessToken) {
          completeLogin('facebook', response.authResponse.accessToken);
        }
      },
      { scope: 'email' }
    );
  };

  if (!settings?.enabled) {
    return null;
  }

  const configuredTitle = t('notConfiguredYet');

  return (
    <div className="space-y-3">
      {settings.googleClientId && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => setGoogleScriptLoaded(true)}
        />
      )}
      {settings.facebookAppId && (
        <Script
          src="https://connect.facebook.net/en_US/sdk.js"
          strategy="afterInteractive"
          onLoad={() => setFacebookScriptLoaded(true)}
        />
      )}

      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-[var(--txt-soft)]">
        <span className="h-px flex-1 bg-[var(--line)]" />
        {t('orContinueWith')}
        <span className="h-px flex-1 bg-[var(--line)]" />
      </div>

      {settings.googleClientId ? (
        <div ref={googleButtonRef} className="flex justify-center" />
      ) : (
        <button
          type="button"
          disabled
          title={configuredTitle}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white/[0.04] px-5 py-3 text-sm font-semibold text-[var(--txt-faint)] opacity-60 cursor-not-allowed"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path fill="#4285F4" d="M23.49 12.27c0-.82-.07-1.42-.22-2.05H12v3.72h6.5c-.13 1.04-.84 2.6-2.42 3.65l-.02.15 3.52 2.72.24.02c2.24-2.06 3.67-5.1 3.67-8.21Z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.06 7.93-2.89l-3.78-2.92c-1.02.7-2.38 1.19-4.15 1.19-3.17 0-5.85-2.08-6.8-4.96l-.14.01-3.66 2.83-.05.14C3.32 21.3 7.34 24 12 24Z" />
            <path fill="#FBBC05" d="M5.2 14.42a7.4 7.4 0 0 1-.4-2.4c0-.84.15-1.65.39-2.4l-.01-.16-3.71-2.88-.12.06A11.96 11.96 0 0 0 0 12.02c0 1.94.47 3.77 1.35 5.38l3.85-2.98Z" />
            <path fill="#EA4335" d="M12 4.75c2.26 0 3.78.97 4.65 1.78l3.4-3.32C17.94 1.19 15.24 0 12 0 7.34 0 3.32 2.7 1.35 6.64l3.84 2.98c.96-2.88 3.64-4.87 6.81-4.87Z" />
          </svg>
          {t('continueWithGoogle')}
        </button>
      )}

      {settings.facebookAppId ? (
        <button
          type="button"
          disabled={loading}
          onClick={handleFacebookLogin}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[#1877F2] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff" aria-hidden="true">
            <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.25h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07Z" />
          </svg>
          {t('continueWithFacebook')}
        </button>
      ) : (
        <button
          type="button"
          disabled
          title={configuredTitle}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white/[0.04] px-5 py-3 text-sm font-semibold text-[var(--txt-faint)] opacity-60 cursor-not-allowed"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.25h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07Z" />
          </svg>
          {t('continueWithFacebook')}
        </button>
      )}

      {(!settings.googleClientId || !settings.facebookAppId) && (
        <p className="text-center text-[11px] text-[var(--txt-faint)]">{configuredTitle}</p>
      )}
    </div>
  );
}
