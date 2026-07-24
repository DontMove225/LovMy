import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Skip /admin, /api, Next internals, and files with an extension (e.g. favicon.ico).
  matcher: ['/((?!api|admin|_next|.*\\..*).*)'],
};
