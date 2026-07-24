export const dynamic = 'force-dynamic';

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lovmy.dontmove.app/api/';
  let config = null;

  try {
    const res = await fetch(`${apiUrl}sms_type.php`, { cache: 'no-store' });
    const data = await res.json();
    config = data.firebase_web_config || null;
  } catch {
    config = null;
  }

  const body = config
    ? `importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp(${JSON.stringify(config)});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || 'LovMy';
  const options = {
    body: (payload.notification && payload.notification.body) || '',
    icon: '/favicon-64.png',
  };
  self.registration.showNotification(title, options);
});
`
    : '// Firebase web config not set yet in Admin -> Paramètres techniques.';

  return new Response(body, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
