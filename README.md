# LovMy — kit de déploiement VPS (staging + prod)

Infra unique, 2 environnements same-origin derrière Traefik/Dokploy.
Voir **GUIDE-DEPLOIEMENT-LOVMY.md** pour la marche complète.

## Démarrage rapide
```bash
# sur le VPS, en root
git clone <ce-depot> /opt/lovmy/kit
sudo bash /opt/lovmy/kit/scripts/bootstrap.sh      # arbo + secrets + détection réseau
nano /opt/lovmy/staging/backend.env                # clés d'intégration
sudo /opt/lovmy/kit/scripts/deploy.sh staging      # build 3 images + up -d
sudo /opt/lovmy/kit/scripts/deploy.sh prod
```

## Contenu
- `compose/docker-compose.yml` — stack unique pilotée par `--env-file` + `-p`
- `compose/frontend.Dockerfile` — Next.js 14 (NEXT_PUBLIC_* + basePath /app au build)
- `compose/landing.Dockerfile` + `nginx-landing.conf` — vitrine statique
- `env/*.env` — modèles (secrets remplis par bootstrap)
- `scripts/bootstrap.sh` · `deploy.sh` · `backup.sh`
- `.github/workflows/deploy.yml` — staging auto, prod manuel

## Routage (par env)
`/` → landing · `/app` → front Next.js · `/api` `/storage` `/up` → backend Laravel
