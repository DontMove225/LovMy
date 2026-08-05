#!/usr/bin/env bash
# Sauvegarde SQL + storage d'un environnement.  Usage: backup.sh <staging|prod>
set -euo pipefail
ENV="${1:-}"; case "$ENV" in staging|prod) ;; *) echo "Usage: $0 <staging|prod>"; exit 1;; esac
ROOT=/opt/lovmy; ENV_DIR="$ROOT/$ENV"; set -a; . "$ENV_DIR/compose.env"; set +a
TS="$(date +%Y%m%d-%H%M%S)"; OUT="$ENV_DIR/backups"; mkdir -p "$OUT"
docker exec "lovmy-db-$ENV" sh -c "exec mariadb-dump -uroot -p\"$DB_ROOT_PASSWORD\" --single-transaction $DB_DATABASE" \
  | gzip > "$OUT/db-$ENV-$TS.sql.gz"
docker run --rm -v "${COMPOSE_PROJECT_NAME}_storage-data:/s:ro" -v "$OUT:/b" alpine \
  tar czf "/b/storage-$ENV-$TS.tar.gz" -C /s .
ls -1 "$OUT"/db-"$ENV"-*.sql.gz     | sort | head -n -14 | xargs -r rm -f
ls -1 "$OUT"/storage-"$ENV"-*.tar.gz | sort | head -n -14 | xargs -r rm -f
echo "Backup OK → $OUT"
