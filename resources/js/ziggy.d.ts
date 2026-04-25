// Global Ziggy route helper declaration
declare global {
    function route(
        name?: string,
        params?: Record<string, unknown> | unknown[] | unknown,
        absolute?: boolean,
    ): {
        current(name?: string, params?: unknown): boolean;
        get params(): Record<string, string>;
        get routeParams(): Record<string, string>;
        has(name: string): boolean;
    } & string;
}

export {};
