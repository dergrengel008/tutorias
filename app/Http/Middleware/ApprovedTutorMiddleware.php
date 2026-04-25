<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApprovedTutorMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Ensures the authenticated user is a tutor and their tutor profile
     * has been approved by an administrator.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            abort(401, 'No autenticado.');
        }

        if (!$request->user()->isTutor()) {
            abort(403, 'No tienes permisos para acceder a esta sección.');
        }

        $tutorProfile = $request->user()->tutorProfile;

        if (!$tutorProfile) {
            abort(403, 'Aún no has creado tu perfil de tutor.');
        }

        if ($tutorProfile->status !== 'approved') {
            if ($tutorProfile->status === 'rejected') {
                abort(403, 'Tu perfil de tutor ha sido rechazado. Motivo: ' . ($tutorProfile->rejection_reason ?? 'No especificado.') . ' Puedes enviar tu perfil nuevamente para revisión.');
            }

            if ($tutorProfile->status === 'suspended') {
                abort(403, 'Tu perfil de tutor ha sido suspendido. Contacta al administrador para más información.');
            }

            // status === 'pending'
            abort(403, 'Tu perfil de tutor aún está pendiente de aprobación. Te notificaremos cuando sea revisado.');
        }

        return $next($request);
    }
}
