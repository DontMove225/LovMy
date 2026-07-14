import './globals.css';
import { Fraunces, Manrope, Space_Grotesk } from 'next/font/google';
import { MyProvider } from '@/context/MyProvider';
import { CallProvider } from '@/context/CallProvider';
import AppShell from './components/AppShell';

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

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${manrope.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-obsidian text-[var(--txt)] font-sans antialiased">
        <MyProvider>
          <CallProvider>
            <AppShell>
              <div id="main-content">
                {children}
              </div>
            </AppShell>
          </CallProvider>
        </MyProvider>
      </body>
    </html>
  );
}
