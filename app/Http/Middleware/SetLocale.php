<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SetLocale
{
    public function handle(Request $request, Closure $next)
    {
        $locale = $request->query('lang')
            ?? $request->header('X-Locale')
            ?? $request->cookie('locale')
            ?? session('locale')
            ?? config('app.locale', 'es');

        if (in_array($locale, ['es', 'en'])) {
            app()->setLocale($locale);
            session(['locale' => $locale]);
        }

        return $next($request)->cookie('locale', app()->getLocale(), 60 * 24 * 365);
    }
}
