# LovMy Platform

This repository contains the LovMy platform source: backend, mobile app, web app, documentation, and database assets.

## Repository structure
- `backend/` — legacy backend (reference implementation)
- `backend_v2/` — new Laravel backend (target architecture)
- `mobile/` — mobile application
- `web/` — frontend web project
- `docs/` — documentation
- `db_lovmy.sql` — database SQL dump

## Development workflow
- Use `main` for production-ready code.
- Use `develop` for integration.
- Create feature branches for each improvement.

## Backend setup
Please refer to [backend_v2/README.md](backend_v2/README.md) for Laravel setup instructions.

## Security note
Passwords must be stored securely. The admin account should be migrated to a hashed format during deployment.
