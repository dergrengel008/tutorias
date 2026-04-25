/**
 * Ziggy route() helper — ZERO dependencies.
 *
 * Reads window.Ziggy injected by app.blade.php inline script.
 * Provides both route('name') and route().current('name') functionality.
 *
 * Usage:
 *   import { route } from '@/route';
 *   route('login')              // => '/login'
 *   route('tutors.show', 5)     // => '/tutors/5'
 *   route().current('home')     // => true/false
 */

// ─── Types ───────────────────────────────────────────────────────

interface ZiggyRoute {
    uri: string;
    methods: string[];
    domain?: string | null;
    wheres?: Record<string, string>;
}

interface ZiggyConfig {
    url: string;
    port?: number | null;
    defaults?: Record<string, string>;
    routes: Record<string, ZiggyRoute>;
    location?: string;
}

// ─── Read config ─────────────────────────────────────────────────

function getZiggy(): ZiggyConfig {
    if (typeof window !== 'undefined' && window.Ziggy && typeof window.Ziggy === 'object' && !Array.isArray(window.Ziggy)) {
        const z = window.Ziggy;
        z.location = window.location.href;
        return z as ZiggyConfig;
    }
    return { url: window?.location?.origin || '', port: null, defaults: {}, routes: {} };
}

// ─── Detect current route ────────────────────────────────────────

function detectCurrentRoute(): { name?: string } {
    const z = getZiggy();
    if (!z.routes || !z.location) return {};

    const urlPath = z.location.replace(z.url, '').split('?')[0] || '/';
    const cleanPath = '/' + urlPath.replace(/^\/+/, '').replace(/\/+$/, '');

    for (const [name, routeDef] of Object.entries(z.routes)) {
        if (!routeDef.methods.includes('GET')) continue;
        const routeUri = '/' + (routeDef.uri || '').replace(/^\/+/, '').replace(/\/+$/, '');

        const regexStr = routeUri
            .replace(/[.*+$()[\]]/g, '\\$&')
            .replace(/(\/?)\{([^}?]+)(\??)\}/g, (_m, slash, _name, optional) => {
                return optional ? `(${slash}[^/]+)?` : `${slash}[^/]+`;
            });

        if (new RegExp(`^${regexStr}/?$`).test(cleanPath)) {
            return { name };
        }
    }
    return {};
}

// ─── Compile URI with params ─────────────────────────────────────

function compileUri(uri: string, params: Record<string, string>): string {
    return uri.replace(/{([^}?]+)(\??)}/g, (_match, name, optional) => {
        const val = params[name];
        if (optional && (val === undefined || val === null)) return '';
        if (!optional && (val === undefined || val === null)) return uri; // keep as-is
        return encodeURIComponent(val || '');
    }).replace(/\/\{[^}]+\?\}/g, '').replace(/\/+/g, '/').replace(/\/+$/, '');
}

// ─── Main route() function ────────────────────────────────────────

function routeFn(
    nameOrNothing?: string,
    params?: Record<string, string | number>,
    absolute?: boolean,
): any {
    // No name → return object with .current()
    if (!nameOrNothing) {
        return {
            current: (pattern?: string) => {
                if (!pattern) return false;
                const { name } = detectCurrentRoute();
                if (!name) return false;
                const regex = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
                return regex.test(name);
            },
            has: (n: string) => !!(getZiggy().routes?.[n]),
        };
    }

    // Named route → resolve URL
    const z = getZiggy();
    const def = z.routes?.[nameOrNothing];
    if (!def) {
        console.warn(`[ziggy] Route "${nameOrNothing}" not found`);
        return '#';
    }

    // Merge params
    const allParams: Record<string, string> = { ...(z.defaults || {}) };
    if (params && typeof params === 'object') {
        for (const [k, v] of Object.entries(params)) {
            allParams[k] = String(v);
        }
    }

    const path = compileUri(def.uri, allParams);

    // Relative URLs by default (best for Inertia)
    if (absolute === true) {
        const base = def.domain
            ? `https://${def.domain}${z.port ? ':' + z.port : ''}`
            : (z.url || window.location.origin);
        return (base + '/' + path).replace(/\/+/g, '/') || '/';
    }

    return '/' + path.replace(/^\/+/, '') || '/';
}

// Set global
if (typeof window !== 'undefined') {
    (window as any).route = routeFn;
}

export { routeFn as route };
export default routeFn;
