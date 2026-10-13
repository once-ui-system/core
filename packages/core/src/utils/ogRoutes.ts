/**
 * Where the app serves its Open Graph routes.
 *
 * No `"use client"`: `Meta.generate` reads these on the server, inside
 * `generateMetadata`, where a React context cannot reach.
 */
export interface OgRoutes {
  /** Returns a page's Open Graph data as JSON. Read by `OgCard` and `useOgData`. */
  fetch: string;
  /** Serves an external image from the app's origin. Used by `useOgData` for `image`. */
  proxy: string;
  /** Renders a social image for a title. Used by `Meta.generate` when no `image` is given. */
  generate: string;
}

export const DEFAULT_OG_ROUTES: Readonly<OgRoutes> = Object.freeze({
  fetch: "/api/og/fetch",
  proxy: "/api/og/proxy",
  generate: "/api/og/generate",
});

/** Fills the routes that are not set (or empty) with the defaults. */
export function resolveOgRoutes(
  routes?: Partial<OgRoutes>,
  fallback: Readonly<OgRoutes> = DEFAULT_OG_ROUTES,
): OgRoutes {
  return {
    fetch: routes?.fetch || fallback.fetch,
    proxy: routes?.proxy || fallback.proxy,
    generate: routes?.generate || fallback.generate,
  };
}

/**
 * `route` with query parameters appended, using `&` when the route already
 * has a query string.
 *
 *     buildOgRouteUrl("/api/og/proxy", { url: "https://example.com/a.png" })
 *     // "/api/og/proxy?url=https%3A%2F%2Fexample.com%2Fa.png"
 */
export function buildOgRouteUrl(route: string, params: Record<string, string>): string {
  const query = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
  if (!query) {
    return route;
  }
  return `${route}${route.includes("?") ? "&" : "?"}${query}`;
}
