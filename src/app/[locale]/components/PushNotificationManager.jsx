'use client';

import { useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { MyContext } from '@/context/MyProvider';
import { playNotificationChime, unlockNotificationSound } from '@/lib/notificationSound';
import NotificationPermissionPrompt from './NotificationPermissionPrompt';

const DISMISS_KEY = 'lovmy_push_prompt_dismissed_at';
const DISMISS_DAYS = 7;

export default function PushNotificationManager() {
  const { basUrl, token: contextToken, bumpUnreadCount } = useContext(MyContext);
  const [config, setConfig] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [registering, setRegistering] = useState(false);

  const authToken = contextToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

  const setupMessaging = useCallback(async (firebaseConfig, vapidKey, tokenForAuth) => {
    const { initializeApp, getApps, getApp } = await import('firebase/app');
    const { getMessaging, getToken, onMessage } = await import('firebase/messaging');

    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const messaging = getMessaging(app);

    const fcmToken = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });

    if (fcmToken) {
      await axios.post(
        `${basUrl}auth/fcm-token`,
        { fcm_token: fcmToken },
        { headers: { Authorization: `Bearer ${tokenForAuth}` } }
      );
    }

    onMessage(messaging, (payload) => {
      console.log('[LovMy push] message received in foreground', payload);
      bumpUnreadCount?.();

      playNotificationChime().catch((error) => {
        console.error('[LovMy push] chime failed', error);
      });

      console.log('[LovMy push] Notification.permission =', Notification.permission);
      if (Notification.permission === 'granted') {
        const title = payload.notification?.title || 'LovMy';
        const body = payload.notification?.body || '';
        try {
          const nativeNotification = new Notification(title, { body, icon: '/favicon-64.png' });
          console.log('[LovMy push] native Notification created', nativeNotification);
        } catch (error) {
          console.error('[LovMy push] new Notification() threw', error);
        }
      }
    });
  }, [basUrl, bumpUnreadCount]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    unlockNotificationSound();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return undefined;
    if (!authToken) return undefined;

    let cancelled = false;

    axios
      .get(`${basUrl}sms_type.php`)
      .then((response) => {
        if (cancelled) return;

        const firebaseConfig = response.data.firebase_web_config;
        const vapidKey = response.data.firebase_vapid_key;
        if (!firebaseConfig || !vapidKey) return;

        setConfig({ firebaseConfig, vapidKey });

        if (Notification.permission === 'granted') {
          // Already granted in a previous session — register silently, no gesture needed.
          setupMessaging(firebaseConfig, vapidKey, authToken).catch((error) => {
            console.error('Push notification setup failed', error);
          });
        } else if (Notification.permission === 'default') {
          // Browsers ignore/suppress requestPermission() calls not tied to a
          // user gesture, so we only show an opt-in prompt here and ask on click.
          const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
          const daysSinceDismiss = (Date.now() - dismissedAt) / 86400000;
          if (!dismissedAt || daysSinceDismiss > DISMISS_DAYS) {
            setShowPrompt(true);
          }
        }
      })
      .catch((error) => {
        console.error('Firebase config fetch failed', error);
      });

    return () => {
      cancelled = true;
    };
  }, [basUrl, authToken, setupMessaging]);

  const handleEnable = async () => {
    if (!config) return;
    unlockNotificationSound();
    setRegistering(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await setupMessaging(config.firebaseConfig, config.vapidKey, authToken);
      }
    } catch (error) {
      console.error('Notification permission request failed', error);
    } finally {
      setRegistering(false);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <NotificationPermissionPrompt onEnable={handleEnable} onDismiss={handleDismiss} loading={registering} />
  );
}
