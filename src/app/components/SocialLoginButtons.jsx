'use client';

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import axios from 'axios';
import { MyContext } from '@/context/MyProvider';

export default function SocialLoginButtons({ onError }) {
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
          onError?.(response.data.ResponseMsg || 'Connexion impossible.');
        }
      } catch (error) {
        onError?.('Erreur réseau. Veuillez réessayer plus tard.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [basUrl, login, router, onError]
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

  if (!settings?.enabled || (!settings.googleClientId && !settings.facebookAppId)) {
    return null;
  }

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
        Ou continuer avec
        <span className="h-px flex-1 bg-[var(--line)]" />
      </div>

      {settings.googleClientId && <div ref={googleButtonRef} className="flex justify-center" />}

      {settings.facebookAppId && (
        <button
          type="button"
          disabled={loading}
          onClick={handleFacebookLogin}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[#1877F2] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Continuer avec Facebook
        </button>
      )}
    </div>
  );
}
