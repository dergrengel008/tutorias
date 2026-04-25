/**
 * Ziggy route() helper — ZERO npm dependencies.
 *
 * Pure TypeScript implementation that reads the Ziggy config injected
 * by app.blade.php via window.Ziggy. No ziggy-js package required.
 *
 * Imported by app.tsx as the very first line, so window.route is
 * available synchronously to all React components.
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ZiggyRoute {
    uri: string;
    methods: string[];
    domain?: string | null;
    wheres?: Record<string, string>;
    bindings?: Record<string, string>;
    defaults?: Record<string, string>;
}

interface ZiggyConfig {
    url: string;
    port?: number | null;
    defaults?: Record<string, string>;
    routes: Record<string, ZiggyRoute>;
    location?: string;
}

type RouteParams = Record<string, unknown> | unknown[] | unknown;

/* ------------------------------------------------------------------ */
/*  Read Ziggy config from DOM / window                                */
/* ------------------------------------------------------------------ */

function getZiggyConfig(): ZiggyConfig {
    // Method 1: window.Ziggy (set by app.blade.php inline script)
    if ((window as any).Ziggy && typeof (window as any).Ziggy === 'object') {
        const z = (window as any).Ziggy as ZiggyConfig;
        // Ensure location stays fresh
        z.location = window.location.href;
        return z;
    }

    // Method 2: Read from Inertia's #app[data-page] element
    const pageEl = document.getElementById('app');
    if (pageEl && pageEl.dataset.page) {
        try {
            const parsed = JSON.parse(pageEl.dataset.page);
            if (parsed.props?.ziggy) {
                const z = parsed.props.ziggy as ZiggyConfig;
                z.location = window.location.href;
                return z;
            }
        } catch (_) { /* fall through */ }
    }

    // Fallback empty config
    return { url: window.location.origin, port: null, defaults: {}, routes: {} };
}

/* ------------------------------------------------------------------ */
/*  URL matching helper                                                */
/* ------------------------------------------------------------------ */

function matchUrl(template: string, url: string, wheres?: Record<string, string>) {
    // Strip domain to get path only
    const tplPath = template.replace(/^\w+:\/\//, '');
    const urlPath = url.replace(/^\w+:\/\//, '').split('?')[0];

    // Build regex from template
    let regex = tplPath
        .replace(/[.*+$()[\]]/g, '\\$&')
        .replace(/(\/?){([^}?]*)(\??)}/g, (_match, slash, name, optional) => {
            const pattern = wheres?.[name]
                ? wheres[name].replace(/^\^/, '').replace(/\$$/, '')
                : '[^/?]+';
            return optional ? `(${slash}${pattern})?` : `${slash}${pattern}`;
        });

    regex = `^${regex}/?$`;
    const match = urlPath.match(regex);
    if (!match) return null;

    // Extract param names from template
    const paramNames = (template.match(/{([^}?]+)(\??)}/g) || [])
        .map(m => m.replace(/[{}?]/g, ''));
    const params: Record<string, string> = {};
    const groups = match.groups || {};
    for (const name of paramNames) {
        if (groups[name] !== undefined) {
            params[name] = decodeURIComponent(groups[name]);
        }
    }

    return params;
}

/* ------------------------------------------------------------------ */
/*  Current URL helper                                                 */
/* ------------------------------------------------------------------ */

interface CurrentRouteResult {
    name?: string;
    params: Record<string, string>;
    query: Record<string, string>;
    route?: ZiggyRoute;
}

function getCurrentRoute(config: ZiggyConfig): CurrentRouteResult {
    const loc = config.location || window.location.href;
    for (const [name, def] of Object.entries(config.routes)) {
        if (!def.methods.includes('GET')) continue;
        const tpl = buildTemplate(config, def);
        const params = matchUrl(tpl, loc, def.wheres);
        if (params) {
            // Parse query string
            const query: Record<string, string> = {};
            const qs = loc.split('?')[1];
            if (qs) {
                for (const pair of qs.split('&')) {
                    const [k, v] = pair.split('=');
                    if (k) query[k] = v ? decodeURIComponent(v) : '';
                }
            }
            return { name, params, query, route: def };
        }
    }
    return { name: undefined, params: {}, query: {} };
}

function buildTemplate(config: ZiggyConfig, def: ZiggyRoute): string {
    const origin = config.url
        .replace(/^\w+:\/\//, '')
        .replace(/\/$/, '');
    return `${origin}/${def.uri}`.replace(/\/+$/, '') || '/';
}

/* ------------------------------------------------------------------ */
/*  Compile a route URI with params                                    */
/* ------------------------------------------------------------------ */

function compileUri(uri: string, params: Record<string, string>, wheres?: Record<string, string>): string {
    return uri.replace(/{([^}?]+)(\??)}/g, (_match, name, optional) => {
        const val = params[name];
        if (optional && (val === undefined || val === null)) return '';
        if (!optional && (val === undefined || val === null)) {
            throw new Error(`Ziggy: '${name}' parameter is required`);
        }
        if (wheres?.[name] && !new RegExp(`^${optional ? `(${wheres[name]})?` : wheres[name]}$`).test(val || '')) {
            throw new Error(`Ziggy: '${name}' = '${val}' doesn't match '${wheres[name]}'`);
        }
        return encodeURIComponent(val || '');
    }).replace(/\/+/g, '/').replace(/\/+$/, '');
}

/* ------------------------------------------------------------------ */
/*  The main route() function                                          */
/* ------------------------------------------------------------------ */

function routeFn(
    name?: string,
    params?: RouteParams,
    absolute?: boolean,
): any {
    const config = getZiggyConfig();

    // No name → return Ziggy-like object with current() etc.
    if (!name) {
        const current = getCurrentRoute(config);
        return {
            current: (n?: string, p?: Record<string, string>) => {
                if (!n) return !!current.name;
                if (!current.name) return false;
                const re = new RegExp(`^${n.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`);
                if (!re.test(current.name)) return false;
                if (!p) return true;
                const merged = { ...current.params, ...current.query };
                return Object.entries(p).every(
                    ([k, v]) => merged[k] == v || merged[k] == decodeURIComponent(String(v))
                );
            },
            get params() { return { ...getCurrentRoute(config).params, ...getCurrentRoute(config).query }; },
            get routeParams() { return getCurrentRoute(config).params; },
            has: (n: string) => n in config.routes,
        };
    }

    // Named route → resolve URL
    const def = config.routes[name];
    if (!def) {
        console.warn(`[ziggy] Route "${name}" not found`);
        return '#';
    }

    // Build params object
    const allParams: Record<string, string> = { ...(config.defaults || {}), ...(def.defaults || {}) };

    if (params && typeof params === 'object' && !Array.isArray(params)) {
        for (const [k, v] of Object.entries(params as Record<string, unknown>)) {
            allParams[k] = String(v);
        }
    } else if (Array.isArray(params)) {
        // Positional params: match to route's parameter segments
        const segs = (def.uri.match(/{([^}?]+)(\??)}/g) || [])
            .map(m => m.replace(/[{}?]/g, ''))
            .filter(n => !config.defaults?.[n] && !def.defaults?.[n]);
        params.forEach((v, i) => {
            if (segs[i]) allParams[segs[i]] = String(v);
        });
    } else if (params !== undefined) {
        // Single scalar → treat as first positional param
        const segs = (def.uri.match(/{([^}?]+)(\??)}/g) || [])
            .map(m => m.replace(/[{}?]/g, ''))
            .filter(n => !config.defaults?.[n] && !def.defaults?.[n]);
        if (segs[0]) allParams[segs[0]] = String(params);
    }

    const path = compileUri(def.uri, allParams, def.wheres);

    // Build absolute URL
    if (absolute === false) {
        return '/' + path.replace(/^\/+/, '');
    }

    let base = '';
    if (def.domain) {
        const protocol = (config.url.match(/^\w+:\/\//) || ['https://'])[0];
        base = protocol + def.domain;
        if (config.port) base += ':' + config.port;
    } else {
        base = config.url || '';
        if (config.port) base += ':' + config.port;
    }

    return (base + '/' + path).replace(/\/+/g, '/').replace(/\/+$/, '') || '/';
}

// Set as global immediately — available before any component renders
(window as any).route = routeFn;

export default routeFn;
export const route = routeFn;
