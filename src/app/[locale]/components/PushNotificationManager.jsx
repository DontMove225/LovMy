'use client';

import { useContext, useEffect } from 'react';
import axios from 'axios';
import { MyContext } from '@/context/MyProvider';

export default function PushNotificationManager() {
  const { basUrl, token: contextToken } = useContext(MyContext);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return undefined;
    if (Notification.permission === 'denied') return undefined;

    const authToken = contextToken || localStorage.getItem('token');
    if (!authToken) return undefined;

    let cancelled = false;

    axios
      .get(`${basUrl}sms_type.php`)
      .then(async (response) => {
        if (cancelled) return;

        const firebaseConfig = response.data.firebase_web_config;
        const vapidKey = response.data.firebase_vapid_key;
        if (!firebaseConfig || !vapidKey) return;

        const { initializeApp } = await import('firebase/app');
        const { getMessaging, getToken, onMessage } = await import('firebase/messaging');

        const app = initializeApp(firebaseConfig);
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        const messaging = getMessaging(app);

        const permission = await Notification.requestPermission();
        if (cancelled || permission !== 'granted') return;

        const fcmToken = await getToken(messaging, {
          vapidKey,
          serviceWorkerRegistration: registration,
        });

        if (fcmToken) {
          await axios.post(
            `${basUrl}auth/fcm-token`,
            { fcm_token: fcmToken },
            { headers: { Authorization: `Bearer ${authToken}` } }
          );
        }

        onMessage(messaging, (payload) => {
          if (Notification.permission !== 'granted') return;
          const title = payload.notification?.title || 'LovMy';
          const body = payload.notification?.body || '';
          new Notification(title, { body, icon: '/favicon-64.png' });
        });
      })
      .catch((error) => {
        console.error('Push notification setup failed', error);
      });

    return () => {
      cancelled = true;
    };
  }, [basUrl, contextToken]);

  return null;
}
