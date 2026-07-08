const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lovmy.fr' },
      { protocol: 'https', hostname: 'lovmy.dontmove.app' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8000' },
    ]
  }
};

export default nextConfig;
