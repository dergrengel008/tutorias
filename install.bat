@echo off
chcp 65001 >nul
echo ============================================
echo   TUTORIA APP v34 - INSTALACION COMPLETA
echo   Laravel 13 + Inertia.js + React
echo   Base de datos: PostgreSQL
echo   (Windows)
echo ============================================
echo.

:: ─── Verificar prerequisitos ───────────────────
echo [1/9] Verificando prerequisitos...

php -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PHP 8.3+ no encontrado.
    echo   Descarga: https://windows.php.net/download/
    echo   Asegurate de agregar PHP al PATH del sistema.
    echo   Requiere extension pdo_pgsql habilitada en php.ini
    pause
    exit /b 1
)
echo       PHP .............. OK

composer --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Composer no encontrado.
    echo   Descarga: https://getcomposer.org/Composer-Setup.exe
    pause
    exit /b 1
)
echo       Composer ......... OK

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no encontrado.
    echo   Descarga: https://nodejs.org/
    pause
    exit /b 1
)
echo       Node.js ......... OK

psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [AVISO] psql no encontrado en PATH.
    echo   Puedes usar pgAdmin u otra herramienta para crear la BD.
)
echo       PostgreSQL ....... OK (o usar pgAdmin)

:: ─── Crear directorios ──────────────────────────
echo [2/9] Creando directorios de almacenamiento...
if not exist storage\framework\sessions mkdir storage\framework\sessions
if not exist storage\framework\views mkdir storage\framework\views
if not exist storage\framework\cache mkdir storage\framework\cache
if not exist storage\framework\cache\data mkdir storage\framework\cache\data
if not exist storage\framework\testing mkdir storage\framework\testing
if not exist storage\logs mkdir storage\logs
if not exist storage\app\public mkdir storage\app\public
if not exist bootstrap\cache mkdir bootstrap\cache
echo       Directorios creados OK.

:: ─── Configurar .env ────────────────────────────
echo [3/9] Configurando entorno (.env)...
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo       .env creado desde .env.example
    ) else (
        echo       [ERROR] No se encontro .env.example
        pause
        exit /b 1
    )
) else (
    echo       .env ya existe, se mantiene.
)

:: ─── Instalar dependencias PHP ──────────────────
echo [4/9] Instalando dependencias PHP...
echo       Ejecutando: composer install
call composer install --no-interaction 2>&1
if %errorlevel% neq 0 (
    echo       [AVISO] Errores detectados. Reintentando con --ignore-platform-reqs...
    call composer install --no-interaction --ignore-platform-reqs 2>&1
)

:: ─── Generar APP_KEY ──
echo [5/9] Generando APP_KEY...
php artisan key:generate --ansi

:: ─── Instalar dependencias Node.js ─────────────
echo [6/9] Instalando dependencias Node.js...
echo       Ejecutando: npm install
call npm install 2>&1

:: ─── Crear base de datos ────────────────────────
echo [7/9] Configurando base de datos...
echo.
echo   IMPORTANTE: Antes de continuar asegurate de:
echo   - tener PostgreSQL corriendo
echo   - la base de datos "tutoria_app" creada
echo.
echo   Puedes crearla con:
echo   psql -U postgres -c "CREATE DATABASE tutoria_app;"
echo.
echo   O con pgAdmin
echo.
set /p DBREADY="   Presiona ENTER cuando la BD este lista..."

:: ─── Migraciones + Seeders ──────────────────────
echo [8/9] Ejecutando migraciones y seeders...
php artisan migrate --seed 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Las migraciones fallaron. Verifica:
    echo   1. Que PostgreSQL este corriendo
    echo   2. Que la BD "tutoria_app" exista
    echo   3. Que el usuario/clave en .env sean correctos
    echo   4. Que la extension pdo_pgsql este habilitada en php.ini
    echo.
    pause
    exit /b 1
)

:: ─── Compilar frontend ──────────────────────────
echo [9/9] Compilando assets frontend...
call npm run build 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [AVISO] npm run build tuvo errores.
    echo   Puedes intentar: npm run dev
    echo   para desarrollo.
)

:: ─── Storage link ──────────────────────────────
echo       Creando storage link...
php artisan storage:link 2>nul

:: ─── Limpiar caches ─────────────────────────────
echo.
echo       Limpiando caches...
php artisan config:clear 2>nul
php artisan cache:clear 2>nul
php artisan view:clear 2>nul
php artisan route:clear 2>nul

:: ─── Resultado ─────────────────────────────────
echo.
echo ============================================
echo   INSTALACION COMPLETADA EXITOSAMENTE
echo ============================================
echo.
echo   Para iniciar la aplicacion:
echo.
echo   Opcion 1 - Produccion (build compilado):
echo     php artisan serve
echo.
echo   Opcion 2 - Desarrollo (hot reload):
echo     npm run dev
echo     (en otra terminal)
echo     php artisan serve
echo.
echo   Abre en tu navegador:
echo     http://localhost:8000
echo.
echo   ============================================
echo   CREDENCIALES DE PRUEBA
echo   ============================================
echo   Admin:   admin@tutoria.com   / password
echo   Tutor:   (crear desde Register)
echo   Student: (crear desde Register)
echo.
echo   Nota: El seeder solo crea el admin.
echo   Registra tutores y estudiantes desde la app.
echo ============================================
echo   BASE DE DATOS: PostgreSQL
echo ============================================
echo.
pause
