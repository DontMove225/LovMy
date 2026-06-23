import './globals.css';
import { MyProvider } from '@/context/MyProvider';
import Header from './components/Header';

export const metadata = {
  title: {
    default: 'LovMy — Rencontres authentiques',
    template: '%s | LovMy',
  },
  description: 'LovMy est la plateforme de rencontres authentiques qui vous connecte avec des personnes qui partagent vos valeurs et vos passions.',
  keywords: ['rencontres', 'dating', 'amour', 'LovMy', 'match', 'chat'],
  authors: [{ name: 'LovMy' }],
  creator: 'LovMy',
  metadataBase: new URL('https://lovmy.fr'),
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://lovmy.fr',
    siteName: 'LovMy',
    title: 'LovMy — Rencontres authentiques',
    description: 'Trouvez votre âme sœur sur LovMy, la plateforme de rencontres qui vous correspond.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LovMy — Rencontres authentiques',
    description: 'Trouvez votre âme sœur sur LovMy.',
    creator: '@lovmy',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <MyProvider>
          <Header />
          <div id="main-content">
            {children}
          </div>
        </MyProvider>
      </body>
    </html>
  );
}
