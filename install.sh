#!/bin/bash
echo "============================================"
echo "  TUTORIA APP v34 - SCRIPT DE INSTALACION"
echo "  Base de datos: PostgreSQL"
echo "============================================"
echo ""

# Verificar PHP
echo "[1/9] Verificando PHP..."
if ! command -v php &> /dev/null; then
    echo "[ERROR] PHP no esta instalado."
    echo "  Descarga: https://www.php.net/downloads.php"
    echo "  Requiere PHP 8.3 o superior"
    exit 1
fi
PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;")
echo "      PHP $PHP_VERSION encontrado OK."

# Verificar Composer
echo "[2/9] Verificando Composer..."
if ! command -v composer &> /dev/null; then
    echo "[ERROR] Composer no esta instalado."
    echo "  Descarga: https://getcomposer.org/download/"
    exit 1
fi
echo "      Composer encontrado OK."

# Verificar Node.js
echo "[3/9] Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js no esta instalado."
    echo "  Descarga: https://nodejs.org/"
    exit 1
fi
echo "      Node.js $(node --version) encontrado OK."

# Verificar PostgreSQL
echo "[4/9] Verificando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "[AVISO] psql no encontrado en PATH."
    echo "      Asegurate de que PostgreSQL este instalado y corriendo."
else
    echo "      PostgreSQL encontrado OK."
    PG_VERSION=$(psql --version)
    echo "      $PG_VERSION"
fi

# Verificar extensiones PHP necesarias
echo "[5/9] Verificando extensiones PHP..."
PHP_OK=true
if ! php -m | grep -q "pdo_pgsql"; then
    echo "      [FALTA] extension pdo_pgsql - Necesaria para PostgreSQL"
    echo "      Instalar: sudo apt install php8.3-pgsql (Linux) o habilitar en php.ini"
    PHP_OK=false
else
    echo "      pdo_pgsql OK"
fi
if ! php -m | grep -q "pgsql"; then
    echo "      [AVISO] extension pgsql no encontrada (recomendada)"
else
    echo "      pgsql OK"
fi
if ! php -m | grep -q "mbstring"; then
    echo "      [FALTA] extension mbstring"
    PHP_OK=false
else
    echo "      mbstring OK"
fi
if ! php -m | grep -q "xml"; then
    echo "      [FALTA] extension xml"
    PHP_OK=false
else
    echo "      xml OK"
fi
if ! php -m | grep -q "ctype"; then
    echo "      [FALTA] extension ctype"
    PHP_OK=false
else
    echo "      ctype OK"
fi
if ! php -m | grep -q "fileinfo"; then
    echo "      [FALTA] extension fileinfo"
    PHP_OK=false
else
    echo "      fileinfo OK"
fi

if [ "$PHP_OK" = false ]; then
    echo ""
    echo "[ERROR] Faltan extensiones PHP necesarias. Instalalas y vuelve a ejecutar."
    exit 1
fi

# Crear directorios necesarios
echo "[6/9] Creando directorios de almacenamiento..."
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/framework/cache/data
mkdir -p storage/framework/testing
mkdir -p storage/logs
mkdir -p bootstrap/cache
chmod -R 775 storage bootstrap/cache
echo "      Directorios creados OK."

# Crear archivo .env si no existe
echo "[7/9] Configurando entorno..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "      .env creado desde .env.example"
    else
        cat > .env << 'ENVFILE'
APP_NAME="TutoriaApp"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=tutoria_app
DB_USERNAME=postgres
DB_PASSWORD=

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=public
QUEUE_CONNECTION=sync
SESSION_DRIVER=file

SANCTUM_STATEFUL_DOMAINS=localhost:8000

JITSI_DOMAIN=meet.jit.si

PAYMENT_BANK_NAME="Banco de Venezuela"
PAYMENT_PHONE="0414-123-4567"
PAYMENT_CI_RIF="V-12345678"
ENVFILE
        echo "      .env creado."
    fi
else
    echo "      .env ya existe, se mantiene."
fi

# Instalar dependencias PHP
echo "[8/9] Instalando dependencias PHP (composer install)..."
composer install --no-interaction 2>&1
if [ $? -ne 0 ]; then
    echo "      [AVISO] Errores detectados. Reintentando con --ignore-platform-reqs..."
    composer install --no-interaction --ignore-platform-reqs 2>&1
fi

# Generar APP_KEY
echo "      Generando APP_KEY..."
php artisan key:generate --ansi

# Instalar dependencias Node.js
echo "[9/9] Instalando dependencias Node.js (npm install)..."
npm install 2>&1

# Compilar assets para produccion
echo "      Compilando assets (npm run build)..."
npm run build 2>&1

# Limpiar caches
echo "      Limpiando caches..."
php artisan config:clear 2>/dev/null
php artisan cache:clear 2>/dev/null
php artisan view:clear 2>/dev/null
php artisan route:clear 2>/dev/null

echo ""
echo "============================================"
echo "  INSTALACION COMPLETADA"
echo "============================================"
echo ""
echo "  PASOS SIGUIENTES:"
echo "  1. Asegurate de que PostgreSQL este corriendo"
echo "  2. Crea la base de datos:"
echo "     sudo -u postgres psql -c \"CREATE DATABASE tutoria_app;\""
echo "     O: createdb tutoria_app"
echo "  3. Configura la conexion en .env (DB_PASSWORD, etc.)"
echo "  4. Ejecuta las migraciones y seeders:"
echo "     php artisan migrate --seed"
echo "  5. Crea el enlace de almacenamiento:"
echo "     php artisan storage:link"
echo "  6. Inicia el servidor:"
echo "     php artisan serve"
echo ""
echo "  O para desarrollo con hot reload:"
echo "     npm run dev    (en una terminal)"
echo "     php artisan serve  (en otra terminal)"
echo ""
echo "  Abre en tu navegador: http://localhost:8000"
echo ""
echo "  ============================================"
echo "  CREDENCIALES DE PRUEBA"
echo "  ============================================"
echo "  Admin:   admin@tutoria.com  /  password"
echo "  Tutor:   (registrarse desde la app)"
echo "  Student: (registrarse desde la app)"
echo "  ============================================"
echo "  BASE DE DATOS: PostgreSQL"
echo "  ============================================"
echo ""
