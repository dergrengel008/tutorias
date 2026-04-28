<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Cache\RateLimiter;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RateLimitMiddleware
{
    public function __construct(
        protected RateLimiter $limiter
    ) {}

    public function handle(Request $request, Closure $next, string $key = 'default', int $maxAttempts = 60, int $decayMinutes = 1): Response
    {
        $ip = $request->ip();
        $userId = $request->user()?->id;
        $rateKey = $userId ? "{$key}:user:{$userId}" : "{$key}:ip:{$ip}";

        if ($this->limiter->tooManyAttempts($rateKey, $maxAttempts)) {
            $seconds = $this->limiter->availableIn($rateKey);

            return response()->json([
                'message' => 'Demasiadas solicitudes. Intenta de nuevo en ' . $seconds . ' segundos.',
                'retry_after' => $seconds,
            ], 429);
        }

        $this->limiter->hit($rateKey, $decayMinutes * 60);

        $response = $next($request);

        $response->headers->set('X-RateLimit-Limit', $maxAttempts);
        $response->headers->set('X-RateLimit-Remaining', max(0, $this->limiter->remaining($rateKey, $maxAttempts)));

        return $response;
    }
}
