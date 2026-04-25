FROM php:8.3-apache

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    zip \
    unzip \
    curl \
    libpq-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo pdo_pgsql zip \
    && apt-get clean

# Habilitar Apache mod_rewrite
RUN a2enmod rewrite

# Instalar Node.js 22
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean

# bcmath y pcntl ya vienen incluidos en PHP 8.3

WORKDIR /var/www/html

# Copiar composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copiar archivos del proyecto
COPY . .

# Instalar dependencias PHP (producción)
RUN composer update --no-dev --optimize-autoloader --no-interaction


# Instalar dependencias Node y compilar
RUN npm install --ignore-scripts \
    && npm run build

# Permisos de storage y cache
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Apache apunta a public/
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Copiar .env.example como .env (Render inyecta las env vars)
RUN cp .env.example .env

# Dar permiso de ejecución al entrypoint
RUN chmod +x /var/www/html/entrypoint.sh

EXPOSE 80

# Usar entrypoint para migraciones automáticas
CMD ["/var/www/html/entrypoint.sh"]
