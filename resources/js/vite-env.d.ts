/// <reference types="vite/client" />

declare module '*.css' {
    const content: string;
    export default content;
}

declare module 'tldraw/tldraw.css' {
    const content: string;
    export default content;
}
