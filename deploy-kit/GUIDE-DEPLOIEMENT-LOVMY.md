# Guide de déploiement — LovMy (staging + prod, infra unique)

VPS Hostinger `srv1357104.hstgr.cloud` (Debian 13, KVM2) · reverse-proxy **Traefik géré par Dokploy** · dépôt multi-branches `github.com/DontMove225/LovMy`.

---

## 1. Ce que révèle le vrai dépôt (et ce qui change)

Le dépôt n'est pas un dossier unique : c'est un **monorepo à une branche par composant**.

| Branche | Composant | Techno | Docker |
|---|---|---|---|
| `Backend` | API + admin | Laravel **12.60** (PHP 8.2) | ✅ `Dockerfile` fourni : **nginx + php-fpm + supervisor dans un seul conteneur**, port 80 |
| `Front-web` | App web | **Next.js 14.2.5** + next-intl (13 langues) | ❌ à fournir |
| `Landing-page` | Vitrine | HTML/CSS/JS statique | ❌ à fournir |
| `Mobile` | App mobile | Flutter | Non hébergé (piloté par l'API) |

Trois constats dictent toute l'architecture :

1. **Le backend est autonome.** Son image embarque déjà nginx. Le `nginx-backend` séparé de votre ancien `docker-compose-staging.yaml` est donc **inutile** : Traefik attaque directement le conteneur backend sur `:80`. L'entrypoint attend la base, exécute `storage:link` et **`migrate --force` à chaque démarrage** — plus besoin de `docker exec … migrate` dans la CI.
2. **Le front appelle l'API en same-origin.** Le code utilise `NEXT_PUBLIC_API_URL` avec pour défauts `https://lovmy.fr/api/` et `https://lovmy.dontmove.app/api/` — c'est-à-dire **`{host}/api/`**, pas un sous-domaine `api.`. Cela tombe parfaitement avec la contrainte « pas de sous-domaine de sous-domaine » : tout tient sur **un seul host par environnement**, et il n'y a **aucun CORS** à gérer.
3. **La landing vise l'apex.** Son `<link rel="canonical">` pointe sur `https://lovmy.fr/`. Elle est donc placée à la racine, et le front Next.js sous `/app`.

> Le backend n'a **pas** l'extension `ext-redis` ni `predis` : Laravel reste en `cache=file`, `session=file`, `queue=sync` (fonctionne d'origine). Redis est fourni **optionnel** (voir §7). C'est aussi un gain de RAM sur un VPS déjà à 49 %.

---

## 2. Décision d'architecture : routage same-origin par chemins

Un **seul host public par environnement**, découpé par préfixe de chemin. Identique en staging et en prod : seule la valeur du host change. C'est ce qui garantit « la même infra pour les deux ».

```
                         Traefik (Dokploy)  · TLS Let's Encrypt
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │  Host(lovmy.dontmove.app) / Host(lovmy.fr)           │
        │                                                      │
   prio 100 ─ /api  /storage  /up ───────────►  backend  (Laravel :80)
   prio  90 ─ /app ───────────────────────────►  frontend (Next.js :3000)
   prio   1 ─ /  (tout le reste) ──────────────►  landing  (nginx  :80)
        └──────────────────────────────────────────────────────┘
                                   │  réseau interne (privé)
                            ┌──────┴───────┐
                          db (MariaDB)   redis (optionnel)
```

| | Staging | Production |
|---|---|---|
| Host | `lovmy.dontmove.app` | `lovmy.fr` (+ `www` → apex, §10) |
| Landing | `…/` | `…/` |
| App web | `…/app` | `…/app` |
| API | `…/api/` | `…/api/` |
| Médias | `…/storage/` | `…/storage/` |

**Pourquoi les chemins et pas des sous-domaines** — Hostinger DNS refuse `api.lovmy.dontmove.app` (sous-domaine de sous-domaine). Le same-origin par chemins respecte cette limite, colle aux défauts du code front, et supprime le CORS. Le seul coût est un `basePath: '/app'` côté Next.js, injecté automatiquement au build (§5) — **sans modifier le repo**.

> **Variante « app à la racine »** si vous préférez ne pas héberger la landing statique : mettez le front Next.js sur `/` (il possède déjà ses composants Hero/Features/Testimonials) et déplacez la landing sur `/promo`. Concrètement : retirez `NEXT_BASE_PATH` du build et passez la règle landing sur `PathPrefix('/promo')`. Le reste ne bouge pas.

---

## 3. Arborescence cible sur le VPS

```
/opt/lovmy/
├── kit/                     ← ce kit (git clone du dépôt de déploiement)
│   ├── compose/             ← docker-compose.yml + Dockerfiles + nginx-landing.conf
│   ├── env/                 ← modèles d'environnement
│   └── scripts/             ← bootstrap.sh · deploy.sh · backup.sh
├── compose/                 ← copie active (remplie par bootstrap)
├── staging/
│   ├── compose.env          ← secrets DB, host, réseau, images  (chmod 600)
│   ├── backend.env          ← .env Laravel monté dans le conteneur (chmod 600)
│   ├── src/{backend,frontend,landing}   ← sources synchronisées par branche
│   └── backups/
└── prod/  … (idem)
```

Les données (MariaDB, `storage/`) vivent dans des **volumes Docker nommés** (`lovmy-staging_db-data`, `lovmy-staging_storage-data`, …). Avantage : le squelette `storage/framework` de l'image est recopié automatiquement au 1er démarrage — pas de casse-tête de permissions comme avec un bind-mount vide.

---

## 4. Prérequis à vérifier (5 min)

**a. Nom exact du réseau Traefik.** Dokploy le nomme en général `dokploy-network` ; vos anciens fichiers disaient `traefik-proxy`. Tranchez :

```bash
docker network ls | grep -Ei 'traefik|dokploy'
```

Reportez la valeur dans `TRAEFIK_NETWORK` des deux `compose.env` (le `bootstrap.sh` tente de la détecter).

**b. DNS Hostinger.** Deux enregistrements **A** vers `72.60.95.26` suffisent :

| Type | Nom | Valeur |
|---|---|---|
| A | `lovmy` (→ `lovmy.dontmove.app`) | `72.60.95.26` |
| A | `@` et `www` (zone `lovmy.fr`) | `72.60.95.26` |

Aucun sous-domaine `api.*` / `app.*` n'est nécessaire — c'est tout l'intérêt du same-origin.

**c. Décommissionner l'ancien stack** (les conteneurs `lovmy-app/db/nginx/redis` visibles dans Dokploy) pour libérer la RAM, une fois le nouveau staging validé (§8).

---

## 5. Installation pas-à-pas

```bash
# 0. Déposer le kit sur le VPS
ssh root@72.60.95.26
mkdir -p /opt/lovmy && cd /opt/lovmy
git clone <URL_DU_DEPOT_DE_DEPLOIEMENT> kit     # ou scp -r ./lovmy-deploy root@…:/opt/lovmy/kit

# 1. Bootstrap (une seule fois) : arborescence + secrets + détection réseau
sudo bash /opt/lovmy/kit/scripts/bootstrap.sh
```

`bootstrap.sh` génère pour **chaque** environnement un `DB_PASSWORD`, un `DB_ROOT_PASSWORD` et une `APP_KEY` Laravel (`base64:…`), et les injecte de façon cohérente dans `compose.env` **et** `backend.env`.

```bash
# 2. Vérifier / compléter les deux fichiers de chaque env
nano /opt/lovmy/staging/compose.env    # ← confirmer TRAEFIK_NETWORK
nano /opt/lovmy/staging/backend.env    # ← Stripe, Firebase, Agora, Twilio, OneSignal, Mail…

# 3. Déployer
sudo /opt/lovmy/kit/scripts/deploy.sh staging
# … valider … puis :
sudo /opt/lovmy/kit/scripts/deploy.sh prod
```

Ce que fait `deploy.sh <env>` :

1. **Synchronise** les 3 branches (`Backend`, `Front-web`, `Landing-page`) dans `src/` via `git clone/fetch` peu profond.
2. **Build** trois images taguées par env :
   - `backend`  → image du dépôt (nginx+php-fpm+supervisor) ;
   - `landing`  → `nginx:alpine` + fichiers statiques ;
   - `frontend` → Next.js avec `NEXT_PUBLIC_API_URL=https://<host>/api/`, `…_IMAGE_URL`, `…_PAYMENT_URL` **et** `basePath=/app` injecté (repo intact).
3. **`docker compose up -d`** avec le bon projet (`-p lovmy-<env>`) et le bon `--env-file`.

> **Firebase** : déposez `firebase-credentials.json` dans le volume storage du backend :
> ```bash
> docker cp firebase-credentials.json lovmy-backend-staging:/var/www/html/storage/firebase-credentials.json
> ```

---

## 6. CI/CD GitHub Actions

Le workflow `deploy.yml` remplace votre `deploy.yaml` (qui faisait un `git pull` incompatible avec un repo multi-branches).

Secrets à créer dans **Settings → Secrets → Actions** : `SSH_HOST` = `72.60.95.26`, `SSH_USER` (ex. `root` ou un user sudo dédié), `SSH_KEY` (clé privée dont la publique est dans `~/.ssh/authorized_keys` du VPS).

Comportement :
- push sur `Backend` → job de test PHP puis **déploiement staging** ;
- push sur `Front-web` / `Landing-page` / `main` → **déploiement staging** ;
- **prod = manuel** : *Actions → LovMy · CI/CD → Run workflow → environment: prod*. Protégez-le avec un *environment* GitHub `production` (approbation requise).

La CI ne fait qu'un `ssh … deploy.sh <env>` : toute la logique reste sur le VPS, versionnée dans le kit.

---

## 7. Redis, queue et scheduler (optionnels)

Par défaut : `cache=file`, `session=file`, `queue=sync` → zéro dépendance, envoi de push synchrone. Pour monter en charge :

**Activer Redis** (le service existe déjà, profil `redis`) :
```bash
# dans compose.env, ajouter :
COMPOSE_PROFILES=redis
```
…puis rendre Laravel capable de parler à Redis : ajoutez `pecl install redis && docker-php-ext-enable redis` au `Dockerfile` du backend (ou `composer require predis/predis`), et dans `backend.env` : `CACHE_DRIVER=redis`, `SESSION_DRIVER=redis`, `QUEUE_CONNECTION=redis`, `REDIS_HOST=redis`.

**Worker de file** (si `queue=redis`) : ajoutez un bloc `[program:worker]` (`php artisan queue:work --sleep=3 --tries=3`) dans `docker/supervisord.conf`, ou un service `worker` réutilisant l'image backend avec `command: php artisan queue:work`.

**Scheduler** : un service léger sur l'image backend avec `command: php artisan schedule:work` si vous avez des tâches planifiées.

---

## 8. Ressources VPS — à surveiller

Le VPS héberge déjà Drupal, GLPI, n8n, WordPress, pgAdmin (**49 % de RAM** au repos). Deux environnements LovMy complets ajoutent ~1 à 1,4 Go. Mesures intégrées :

- `mem_limit` / `cpus` sur chaque service (voir `compose.env`) — staging plus serré que prod ;
- Redis **désactivé** par défaut ;
- **décommissionnez l'ancien stack** LovMy après validation :
  ```bash
  docker rm -f lovmy-app lovmy-db lovmy-nginx lovmy-redis 2>/dev/null || true
  ```

**Option économie (RAM/disque) — une seule MariaDB pour les deux envs.** Plutôt que deux conteneurs `db`, gardez celui de prod et créez-y une base `lovmy_staging` ; pointez `backend.env` de staging sur cet host. Vous économisez ~250 Mo. À ne faire que si la RAM devient critique : on perd l'isolation prod/staging.

Surveillance rapide : `docker stats --no-stream`.

---

## 9. Exploitation

```bash
# État
docker compose -p lovmy-staging -f /opt/lovmy/compose/docker-compose.yml ps
# Logs
docker logs -f lovmy-backend-staging
docker logs -f lovmy-frontend-staging
# Migrations manuelles (normalement auto à chaque déploiement)
docker exec lovmy-backend-prod php artisan migrate --force
docker exec lovmy-backend-prod php artisan optimize
# Sauvegarde (SQL gz + storage tar) + rétention 14
sudo /opt/lovmy/kit/scripts/backup.sh prod
# Rollback : redéployer un commit précis
git -C /opt/lovmy/prod/src/backend checkout <sha> && sudo /opt/lovmy/kit/scripts/deploy.sh prod
```

Planifiez la sauvegarde : `crontab -e` → `30 3 * * * /opt/lovmy/kit/scripts/backup.sh prod`.

---

## 10. Dépannage

| Symptôme | Cause probable | Action |
|---|---|---|
| 404 Traefik sur tout | mauvais `TRAEFIK_NETWORK` | `docker network ls`, corriger `compose.env`, redéployer |
| Le conteneur tourne mais pas de route | plusieurs réseaux, Traefik ne sait pas lequel | le label `traefik.docker.network` est déjà posé — vérifier qu'il matche le réseau réel |
| Certificat TLS absent | `certresolver` mal nommé | valeur Dokploy usuelle = `letsencrypt` ; sinon lire `docker inspect` du conteneur Traefik |
| `/app` casse (CSS/JS 404) | `basePath` non pris en compte | vérifier dans les logs de build `basePath injecté: /app` ; le front doit être rebuild, pas seulement redémarré |
| API `/api/xxx.php` en 404 | requête arrivée sur landing/front | priorités : `/api` = 100 > `/app` = 90 > `/` = 1 (déjà réglé) |
| `SQLSTATE… connection refused` au boot | DB pas prête | l'entrypoint attend MySQL ; vérifier que `DB_PASSWORD` est **identique** dans `compose.env` et `backend.env` |
| `www.lovmy.fr` non redirigé | routeur www absent | ajouter sur le service `landing` (prod) : `traefik.http.routers.lovmy-prod-www.rule=Host('www.lovmy.fr')` + middleware `redirectregex` vers l'apex |

**Redirection www (prod), labels prêts à coller** sur le service `landing` :
```yaml
- "traefik.http.routers.lovmy-prod-www.rule=Host(`www.lovmy.fr`)"
- "traefik.http.routers.lovmy-prod-www.entrypoints=websecure"
- "traefik.http.routers.lovmy-prod-www.tls.certresolver=letsencrypt"
- "traefik.http.routers.lovmy-prod-www.middlewares=lovmy-prod-www-r"
- "traefik.http.middlewares.lovmy-prod-www-r.redirectregex.regex=^https://www\\.lovmy\\.fr/(.*)"
- "traefik.http.middlewares.lovmy-prod-www-r.redirectregex.replacement=https://lovmy.fr/$${1}"
```

---

## 11. Checklist de mise en ligne

- [ ] `TRAEFIK_NETWORK` confirmé (`docker network ls`)
- [ ] DNS : `lovmy.dontmove.app` et `lovmy.fr` (+`www`) → `72.60.95.26`
- [ ] `bootstrap.sh` exécuté ; secrets générés ; `compose.env`/`backend.env` en `chmod 600`
- [ ] Clés d'intégration renseignées (`backend.env`)
- [ ] `deploy.sh staging` OK → `https://lovmy.dontmove.app` (landing), `/app`, `/api/faq.php`
- [ ] `firebase-credentials.json` copié dans le volume storage
- [ ] Secrets GitHub `SSH_*` créés ; workflow staging vert
- [ ] `deploy.sh prod` OK ; environment GitHub `production` protégé
- [ ] Ancien stack LovMy supprimé ; cron de backup posé
