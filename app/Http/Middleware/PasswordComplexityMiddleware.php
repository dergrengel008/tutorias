<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PasswordComplexityMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->isMethod('POST') && $request->has('password')) {
            $password = $request->password;

            if (strlen($password) < 8) {
                return back()->withErrors(['password' => 'La contraseña debe tener al menos 8 caracteres.']);
            }

            if (!preg_match('/[A-Z]/', $password)) {
                return back()->withErrors(['password' => 'La contraseña debe contener al menos una letra mayúscula.']);
            }

            if (!preg_match('/[a-z]/', $password)) {
                return back()->withErrors(['password' => 'La contraseña debe contener al menos una letra minúscula.']);
            }

            if (!preg_match('/[0-9]/', $password)) {
                return back()->withErrors(['password' => 'La contraseña debe contener al menos un número.']);
            }
        }

        return $next($request);
    }
}
