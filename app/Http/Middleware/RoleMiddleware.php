<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Restricts access to users with one of the specified roles.
     * Also ensures the authenticated user's account is active.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user()) {
            abort(401, 'No autenticado.');
        }

        if (!in_array($request->user()->role, $roles)) {
            abort(403, 'No tienes permisos para acceder a esta sección.');
        }

        if (!$request->user()->is_active) {
            abort(403, 'Tu cuenta está desactivada.');
        }

        return $next($request);
    }
}
