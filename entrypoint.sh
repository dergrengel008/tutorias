#!/bin/bash
set -e

php artisan key:generate --force 2>/dev/null
php artisan config:clear

# Crear enlace simbólico de storage
php artisan storage:link 2>/dev/null

# Fix HTTPS
if [ -n "$RENDER_EXTERNAL_URL" ]; then
    sed -i "s|APP_URL=.*|APP_URL=${RENDER_EXTERNAL_URL}|g" /var/www/html/.env
fi

# Fix Neon: escribir vars en Apache envvars
if [ -n "$DATABASE_URL" ]; then
    FIXED_DB_URL=$(echo "$DATABASE_URL" | sed 's/-pooler//g')
    echo "export DATABASE_URL=\"$FIXED_DB_URL\"" >> /etc/apache2/envvars
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=${FIXED_DB_URL}|g" /var/www/html/.env
fi
if [ -n "$DB_HOST" ]; then
    FIXED_DB_HOST=$(echo "$DB_HOST" | sed 's/-pooler//g')
    echo "export DB_HOST=\"$FIXED_DB_HOST\"" >> /etc/apache2/envvars
    sed -i "s|DB_HOST=.*|DB_HOST=${FIXED_DB_HOST}|g" /var/www/html/.env
fi

echo ">>> Running database migrations..."
php artisan migrate:fresh --force

if [ ! -f /var/www/html/storage/.migrated ]; then
    echo ">>> Running database seeders..."
    php artisan db:seed --force
    touch /var/www/html/storage/.migrated
fi

php artisan config:cache
php artisan route:cache
php artisan view:cache
exec apache2-foreground