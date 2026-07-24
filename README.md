# LovMy Backend v2

This repository contains the initial structure for a modern Laravel backend for the LovMy platform. It is designed to replace the legacy PHP backend and serve both the mobile application and the future Next.js web frontend.

## Project goals
- Keep the same admin account behavior for the legacy system.
- Store the admin password securely using a proper hash (`bcrypt` / `argon2`).
- Provide a clean REST API for authentication, users, settings, plans, packages, reports, and content management.
- Reuse the existing database model from [db_lovmy.sql](../db_lovmy.sql) as the main reference.

## Recommended repository structure
- `backend_v2/` → Laravel API backend
- `mobile/` → mobile application
- `web/` → web frontend (Next.js or another frontend)
- `docs/` → technical documentation
- `db/` → SQL dumps and migration scripts

## Local setup
1. Install PHP 8.2+ and Composer.
2. Clone the repository and go to the backend folder.
3. Run `composer install`.
4. Copy `.env.example` to `.env`.
5. Configure your MySQL database in `.env`.
6. Run `php artisan key:generate`.
7. Run `php artisan migrate --seed`.

## Default admin account
The seed will create an administrator account with the username `admin`.
The password is initially set to `admin@123` during the first setup, but it should be changed immediately after deployment.

## API routes
Typical API endpoints will include:
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/admin/dashboard`
- `GET /api/users`

## Security recommendations
- Use strong secrets in production.
- Always hash passwords.
- Protect admin routes with authentication and role checks.
- Use HTTPS in production.
- Keep secrets out of the repository.

## Notes about the legacy database
The file [db_lovmy.sql](../db_lovmy.sql) is the main reference for the old platform schema. The Laravel backend should gradually migrate and normalize this structure instead of relying on the old PHP logic.

## Suggested Git workflow
- `main` → production-ready code
- `develop` → main integration branch
- `feature/*` → new features
- `hotfix/*` → urgent fixes

## Next steps
- Map all legacy PHP endpoints to Laravel controllers/services.
- Create migrations for all major modules.
- Replace plain-text legacy credentials with secure hashing.
- Secure the API for both mobile and web clients.
