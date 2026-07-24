import '../globals.css';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Fraunces, Manrope, Space_Grotesk } from 'next/font/google';
import { routing } from '@/i18n/routing';
import { MyProvider } from '@/context/MyProvider';
import { CallProvider } from '@/context/CallProvider';
import AppShell from './components/AppShell';
import PushNotificationManager from './components/PushNotificationManager';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  style: ['normal', 'italic'],
  weight: ['400', '700'],
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['500', '600', '700'],
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata = {
  title: {
    default: 'LovMy — Never be lonely',
    template: '%s | LovMy',
  },
  description: 'LovMy est la plateforme de rencontres nouvelle génération qui connecte l\'intelligence du matching et la chaleur de l\'humain.',
  keywords: ['rencontres', 'dating', 'amour', 'LovMy', 'match', 'chat'],
  authors: [{ name: 'LovMy' }],
  creator: 'LovMy',
  metadataBase: new URL('https://lovmy.fr'),
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://lovmy.fr',
    siteName: 'LovMy',
    title: 'LovMy — Never be lonely',
    description: 'Quand l\'intelligence rencontre l\'attirance. Trouvez votre match sur LovMy.',
    images: ['/og-image-source.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LovMy — Never be lonely',
    description: 'Quand l\'intelligence rencontre l\'attirance.',
    creator: '@lovmy',
  },
  icons: {
    icon: '/favicon-64.png',
    apple: '/logo-lovmy.png',
  },
};

export const viewport = {
  themeColor: '#080714',
};

const RTL_LOCALES = ['ar'];

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={`${fraunces.variable} ${manrope.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-obsidian text-[var(--txt)] font-sans antialiased">
        <NextIntlClientProvider>
          <MyProvider>
            <PushNotificationManager />
            <CallProvider>
              <AppShell>
                <div id="main-content">
                  {children}
                </div>
              </AppShell>
            </CallProvider>
          </MyProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
