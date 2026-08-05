#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════
#  LovMy — bootstrap VPS (à lancer UNE fois, en root, depuis le kit)
#  Prépare /opt/lovmy, détecte le réseau Traefik, génère les secrets.
# ══════════════════════════════════════════════════════════════════════════
set -euo pipefail

KIT="$(cd "$(dirname "$0")/.." && pwd)"
ROOT=/opt/lovmy
GREEN='\033[0;32m'; YEL='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
say(){ echo -e "${GREEN}▸${NC} $*"; }
warn(){ echo -e "${YEL}⚠${NC}  $*"; }

[ "$(id -u)" -eq 0 ] || { echo -e "${RED}Lance en root.${NC}"; exit 1; }
command -v docker >/dev/null || { echo -e "${RED}Docker introuvable.${NC}"; exit 1; }
command -v openssl >/dev/null || { apt-get update -y && apt-get install -y openssl; }

# ── 1. Détection du réseau Traefik ────────────────────────────────────────
say "Réseaux Docker contenant traefik/dokploy :"
docker network ls --format '  - {{.Name}}' | grep -Ei 'traefik|dokploy' || warn "Aucun réseau traefik/dokploy détecté !"
NET_GUESS="$(docker network ls --format '{{.Name}}' | grep -Ei 'dokploy-network|traefik-proxy' | head -1 || true)"
[ -n "$NET_GUESS" ] && say "Réseau probable : ${NET_GUESS}  (vérifie-le dans compose.env → TRAEFIK_NETWORK)"

# ── 2. Arborescence ───────────────────────────────────────────────────────
say "Création de l'arborescence sous ${ROOT}"
mkdir -p "$ROOT/compose"
cp "$KIT/compose/"* "$ROOT/compose/"

gen_env(){
  local env="$1" dir="$ROOT/$env"
  mkdir -p "$dir/src" "$dir/backups"
  if [ -f "$dir/compose.env" ]; then
    warn "$env : compose.env existe déjà — inchangé (secrets préservés)."
    return
  fi
  cp "$KIT/env/compose.$env.env"  "$dir/compose.env"
  cp "$KIT/env/backend.$env.env"  "$dir/backend.env"

  # Secrets
  local DBPASS ROOTPASS APPKEY
  DBPASS="$(openssl rand -hex 16)"
  ROOTPASS="$(openssl rand -hex 16)"
  APPKEY="base64:$(openssl rand -base64 32)"

  sed -i "s#__CHANGE_ME_DB__#${DBPASS}#g"       "$dir/compose.env" "$dir/backend.env"
  sed -i "s#__CHANGE_ME_ROOT__#${ROOTPASS}#g"   "$dir/compose.env"
  sed -i "s#__CHANGE_ME_APPKEY__#${APPKEY}#g"   "$dir/backend.env"

  if [ -n "$NET_GUESS" ]; then
    sed -i "s#^TRAEFIK_NETWORK=.*#TRAEFIK_NETWORK=${NET_GUESS}#" "$dir/compose.env"
  fi
  chmod 600 "$dir/compose.env" "$dir/backend.env"
  say "$env : env généré (DB pass + APP_KEY OK) → $dir"
}

gen_env staging
gen_env prod

echo
say "Bootstrap terminé. Étapes suivantes :"
cat <<TXT
  1. Vérifie TRAEFIK_NETWORK dans /opt/lovmy/{staging,prod}/compose.env
  2. Complète les clés d'intégration dans /opt/lovmy/{staging,prod}/backend.env
     (Stripe, Firebase, Agora, Twilio, OneSignal, Mail…)
  3. Déploie :   sudo $KIT/scripts/deploy.sh staging
                 sudo $KIT/scripts/deploy.sh prod
TXT
