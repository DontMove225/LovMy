#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════
#  LovMy — deploy.sh <staging|prod>
#  Synchronise les 3 branches, build les images, (re)déploie la stack.
# ══════════════════════════════════════════════════════════════════════════
set -euo pipefail

ENV="${1:-}"
case "$ENV" in staging|prod) ;; *) echo "Usage: $0 <staging|prod>"; exit 1;; esac

ROOT=/opt/lovmy
ENV_DIR="$ROOT/$ENV"
COMPOSE="$ROOT/compose"
REPO_URL="${LOVMY_REPO_URL:-https://github.com/DontMove225/LovMy.git}"
GREEN='\033[0;32m'; NC='\033[0m'; say(){ echo -e "${GREEN}▸ [$ENV]${NC} $*"; }

[ -f "$ENV_DIR/compose.env" ] || { echo "compose.env manquant — lance bootstrap.sh d'abord."; exit 1; }
set -a; . "$ENV_DIR/compose.env"; set +a

# ── 1. Synchronisation des sources (repo multi-branches) ──────────────────
sync_branch(){ # $1=sous-dossier  $2=branche
  local d="$ENV_DIR/src/$1"
  if [ -d "$d/.git" ]; then
    say "maj $1 ($2)"; git -C "$d" fetch --depth 1 origin "$2" -q
    git -C "$d" checkout -f -B "$2" "origin/$2" -q
  else
    say "clone $1 ($2)"; git clone --depth 1 --branch "$2" "$REPO_URL" "$d" -q
  fi
}
sync_branch backend  Backend
sync_branch frontend Front-web
sync_branch landing  Landing-page

# La landing a besoin de la conf nginx dans son contexte de build
cp "$COMPOSE/nginx-landing.conf" "$ENV_DIR/src/landing/nginx-landing.conf"

# ── 2. Build des images (frontend = NEXT_PUBLIC_* same-origin + basePath) ──
say "build backend  → $BACKEND_IMAGE"
docker build -q -t "$BACKEND_IMAGE" "$ENV_DIR/src/backend" >/dev/null

say "build landing  → $LANDING_IMAGE"
docker build -q -t "$LANDING_IMAGE" \
  -f "$COMPOSE/landing.Dockerfile" "$ENV_DIR/src/landing" >/dev/null

say "build frontend → $FRONTEND_IMAGE  (API=https://$PUBLIC_HOST/api/)"
docker build -q -t "$FRONTEND_IMAGE" \
  -f "$COMPOSE/frontend.Dockerfile" \
  --build-arg NEXT_PUBLIC_API_URL="https://$PUBLIC_HOST/api/" \
  --build-arg NEXT_PUBLIC_IMAGE_URL="https://$PUBLIC_HOST/" \
  --build-arg NEXT_PUBLIC_PAYMENT_URL="https://$PUBLIC_HOST/" \
  --build-arg NEXT_BASE_PATH="/app" \
  "$ENV_DIR/src/frontend" >/dev/null

# ── 3. Déploiement ────────────────────────────────────────────────────────
say "docker compose up"
docker compose -p "$COMPOSE_PROJECT_NAME" \
  --env-file "$ENV_DIR/compose.env" \
  -f "$COMPOSE/docker-compose.yml" \
  up -d --remove-orphans

docker image prune -f >/dev/null || true
say "OK — https://$PUBLIC_HOST  (app: /app · api: /api/)"
docker compose -p "$COMPOSE_PROJECT_NAME" -f "$COMPOSE/docker-compose.yml" ps
