# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
# Match the npm major version the lockfile was generated with — npm 10's stricter
# `ci` sync-check rejects lockfiles written by npm 11 even when nothing is actually
# out of sync, so pin the same major here rather than fighting spurious EUSAGE errors.
RUN npm install -g npm@11
# More patient against a flaky/slow connection: longer per-request timeout plus
# more retries with backoff before giving up.
RUN npm config set fetch-timeout 600000 \
    && npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
