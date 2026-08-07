import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    '/',
    '/(fr|en|de|es|it|pt|pl|is|ja|ko|zh|ar|th)/:path*',
    '/((?!api|admin|_next|_vercel|.*\\..*).*)'
  ]
};
