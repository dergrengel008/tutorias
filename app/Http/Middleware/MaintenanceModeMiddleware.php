<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\PlatformSetting;
use Inertia\Inertia;

class MaintenanceModeMiddleware
{
    /**
     * If maintenance_mode is ON, block all non-admin users.
     * Admins can still access the entire app (including Settings to turn it off).
     */
    public function handle(Request $request, Closure $next)
    {
        $maintenance = PlatformSetting::get('maintenance_mode', false);

        if ($maintenance) {
            $user = $request->user();

            // Allow admins full access
            if ($user && $user->role === 'admin') {
                return $next($request);
            }

            // API requests (whiteboard sync, notifications count, etc.)
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Plataforma en mantenimiento.'], 503);
            }

            // Show the maintenance page for everyone else
            return Inertia::render('Maintenance', [
                'platformName' => PlatformSetting::get('platform_name', 'TutoriaApp'),
                'supportEmail' => PlatformSetting::get('support_email', 'soporte@tutoriaapp.com'),
            ])->toResponse($request)->setStatusCode(503);
        }

        return $next($request);
    }
}
