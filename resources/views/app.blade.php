<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
        <title>{{ config('app.name', 'TutoriaApp') }}</title>

        @php
            // Try to read the Vite build manifest for the CSS file
            $manifestPath = public_path('build/manifest.json');
            $builtCssUrl = null;
            if (file_exists($manifestPath)) {
                $manifest = json_decode(file_get_contents($manifestPath), true);
                if ($manifest && isset($manifest['resources/css/app.css']['file'])) {
                    $builtCssUrl = asset('build/' . $manifest['resources/css/app.css']['file']);
                }
            }

            // Build Ziggy config DIRECTLY from Laravel router (bypass tightenco/ziggy class)
            $ziggyRoutes = new \stdClass();
            try {
                $laravelRoutes = app('router')->getRoutes()->getRoutesByName();
                foreach ($laravelRoutes as $name => $route) {
                    if (is_string($name) && strpos($name, 'generated::') !== 0) {
                        $ziggyRoutes->$name = [
                            'methods' => $route->methods(),
                            'uri'     => '/' . ltrim($route->uri(), '/'),
                            'domain'  => $route->domain() ?: null,
                            'wheres'  => (object) ($route->wheres ?? []),
                        ];
                    }
                }
            } catch (\Throwable $e) {
                // If even the router fails, routes stay empty
            }
        @endphp

        @if($builtCssUrl)
            {{-- Built CSS exists -- use it directly (works without Vite running) --}}
            <link rel="stylesheet" href="{{ $builtCssUrl }}">
        @else
            {{-- No build found -- use Tailwind CDN as fallback --}}
            <script src="https://cdn.tailwindcss.com"></script>
            <script>
                tailwind.config = {
                    theme: {
                        extend: {
                            fontFamily: {
                                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                            }
                        }
                    }
                }
            </script>
        @endif

        {{-- Ziggy route data + route() helper -- must load BEFORE Vite --}}
        <script>
        (function() {
            // Inject all named routes from Laravel into window.Ziggy
            window.Ziggy = {
                url:      {{ \Illuminate\Support\Js::from(url('/')) }},
                port:     null,
                defaults: {},
                routes:   @json($ziggyRoutes),
                location: {{ \Illuminate\Support\Js::from(url()->current()) }}
            };

            // Safety check -- if routes are still empty, keep page from crashing
            if (!window.Ziggy || typeof window.Ziggy !== 'object' || !window.Ziggy.routes) {
                window.Ziggy = { url: location.origin, port: null, defaults: {}, routes: {}, location: location.href };
            }

            // Inline window.route -- returns RELATIVE URLs by default (best for Inertia)
            window.route = function(name, params, absolute) {
                if (!name) return '';
                params = params || {};

                var z = window.Ziggy;
                if (!z || !z.routes || !z.routes[name]) {
                    console.warn('[ziggy] Route "' + name + '" not found');
                    return '#';
                }

                var route = z.routes[name];
                var uri = route.uri || '';

                // Merge defaults
                var allParams = Object.assign({}, z.defaults || {}, route.defaults || {}, params);

                // Replace {param} with values
                Object.keys(allParams).forEach(function(key) {
                    var val = allParams[key];
                    var re1 = new RegExp('\\{' + key + '\\?\\}', 'g');
                    var re2 = new RegExp('\\{' + key + '\\}', 'g');
                    if (uri.match(re1)) {
                        uri = uri.replace(re1, encodeURIComponent(val));
                    } else {
                        uri = uri.replace(re2, encodeURIComponent(val));
                    }
                });

                // Remove remaining optional params
                uri = uri.replace(/\/\{[^}]+\?\}/g, '').replace(/\/+/g, '/');

                // Relative URLs by default -- Inertia handles the base
                if (absolute === true) {
                    var base = '';
                    if (route.domain) {
                        base = 'https://' + route.domain + (z.port ? ':' + z.port : '');
                    } else {
                        base = z.url || location.origin;
                    }
                    return (base + uri).replace(/\/+/g, '/');
                }

                return uri || '/';
            };

            // Make route() globally available to Inertia pages
            if (typeof globalThis !== 'undefined') {
                globalThis.route = window.route;
                globalThis.Ziggy  = window.Ziggy;
            }
        })();
        </script>

        {{-- React HMR preamble (required by @vitejs/plugin-react) --}}
        @viteReactRefresh
        {{-- Vite assets (CSS + JS) --}}
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])

        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
