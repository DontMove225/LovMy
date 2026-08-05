# ─── LovMy Front-web (Next.js 14.2.5 + next-intl) ────────────────────────────
#  Les NEXT_PUBLIC_* sont figées AU BUILD → une image par environnement.
#  basePath est injecté ici pour servir l'app sous /app SANS toucher au repo.
#  (Optimisation possible : ajouter `output: 'standalone'` dans next.config.mjs)

FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_IMAGE_URL
ARG NEXT_PUBLIC_PAYMENT_URL
ARG NEXT_BASE_PATH
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_IMAGE_URL=$NEXT_PUBLIC_IMAGE_URL \
    NEXT_PUBLIC_PAYMENT_URL=$NEXT_PUBLIC_PAYMENT_URL \
    NEXT_TELEMETRY_DISABLED=1

# Injecte basePath (ex: /app) dans next.config.mjs si fourni — repo intact.
RUN if [ -n "$NEXT_BASE_PATH" ]; then \
      sed -i "s#const nextConfig = {#const nextConfig = {\n  basePath: '${NEXT_BASE_PATH}',\n  trailingSlash: false,#" next.config.mjs ; \
      echo "basePath injecté: $NEXT_BASE_PATH" ; \
    fi

RUN npm run build

# ─── Runtime ─────────────────────────────────────────────────────────────────
FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm", "run", "start"]
