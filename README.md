# TutoriaApp

Plataforma educativa que conecta estudiantes con tutores especializados mediante tutorías personalizadas en vivo.

## Tecnologías

- **Backend:** Laravel 13, PHP 8.3
- **Frontend:** React 19, Inertia.js, TypeScript, Tailwind CSS 4
- **Base de datos:** PostgreSQL (Neon)
- **Pizarra:** tldraw v4
- **Infraestructura:** Docker, Render.com

## Requisitos

- PHP 8.3+
- Node.js 22+
- PostgreSQL 15+
- Composer 2.x

## Instalación

```bash
git clone https://github.com/dergrengel008/tutorias.git
cd tutorias
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm run dev
```

## Deploy en Render

El proyecto incluye `Dockerfile` y `entrypoint.sh` para deploy automático en Render.com.

Variables de entorno requeridas:
- `DB_HOST` - Host de PostgreSQL (sin -pooler)
- `DB_PORT` - Puerto de PostgreSQL
- `DB_DATABASE` - Nombre de la base de datos
- `DB_USERNAME` - Usuario de PostgreSQL
- `DB_PASSWORD` - Contraseña de PostgreSQL
- `RENDER_EXTERNAL_URL` - URL pública del servicio

## Tests

```bash
php artisan test
```

## Licencia

Proyecto privado. Todos los derechos reservados.
