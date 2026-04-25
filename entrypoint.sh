#!/bin/bash
set -e

php artisan key:generate --force 2>/dev/null
php artisan config:clear
php artisan storage:link 2>/dev/null

if [ -n "$RENDER_EXTERNAL_URL" ]; then
    sed -i "s|APP_URL=.*|APP_URL=${RENDER_EXTERNAL_URL}|g" /var/www/html/.env
fi

if [ -n "$DB_HOST" ]; then
    FIXED_DB_HOST=$(echo "$DB_HOST" | sed 's/-pooler//g')
    echo "export DB_HOST=\"$FIXED_DB_HOST\"" >> /etc/apache2/envvars
    sed -i "s|DB_HOST=.*|DB_HOST=${FIXED_DB_HOST}|g" /var/www/html/.env
fi

echo ">>> Running database migrations..."
php artisan migrate --force

# Only seed if no users exist
USER_COUNT=$(php artisan tinker --execute="echo \App\Models\User::count();" 2>/dev/null | tail -1)
if [ "$USER_COUNT" = "0" ]; then
    echo ">>> Running database seeders..."
    php artisan db:seed --force
fi

php artisan config:cache
php artisan route:cache
php artisan view:cache

echo ">>> TutoriaApp is ready!"
exec apache2-foreground
