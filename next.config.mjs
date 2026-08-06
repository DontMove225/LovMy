import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.js');

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lovmy.fr' },
      { protocol: 'https', hostname: 'lovmy.dontmove.app' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8000' },
    ]
  }
};

export default withNextIntl(nextConfig);
