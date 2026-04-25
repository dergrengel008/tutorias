<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Cache\RateLimiter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter as FacadeRateLimiter;
use Symfony\Component\HttpFoundation\Response;

class RateLimitMiddleware
{
    public function handle(Request $request, Closure $next, int $maxAttempts = 5, int $decayMinutes = 1): Response
    {
        $key = strtolower($request->method()) . '|' . $request->ip() . '|' . $request->path();

        if (FacadeRateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = FacadeRateLimiter::availableIn($key);
            return response()->json([
                'message' => 'Demasiados intentos. Por favor, espera ' . $seconds . ' segundos antes de intentar de nuevo.',
            ], 429);
        }

        FacadeRateLimiter::hit($key, $decayMinutes * 60);

        $response = $next($request);

        // On successful login, clear the rate limiter
        if ($request->path() === 'login' && $request->isMethod('POST') && $response->getStatusCode() === 302) {
            // Check if it's a successful login (redirect without errors)
            FacadeRateLimiter::clear($key);
        }

        return $response;
    }
}
