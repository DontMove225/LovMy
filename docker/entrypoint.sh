#!/bin/sh
set -e
cd /var/www/html

if [ ! -f .env ]; then
    cp .env.example .env
    php artisan key:generate --ansi
fi

echo "Waiting for MySQL at ${DB_HOST:-mysql}:${DB_PORT:-3306}..."
until php -r "new PDO('mysql:host=${DB_HOST:-mysql};port=${DB_PORT:-3306}', '${DB_USERNAME:-root}', '${DB_PASSWORD}');" 2>/dev/null; do
    sleep 1
done

php artisan package:discover --ansi

# Any symlink baked into the image or left over from a host bind-mount points
# at the wrong (host) absolute path -- always drop and recreate it.
rm -f public/storage
php artisan storage:link
php artisan migrate --force

exec "$@"
