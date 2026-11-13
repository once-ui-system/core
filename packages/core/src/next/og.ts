import {
  DEFAULT_OG_IMAGE_TYPES,
  handleOGFetch,
  handleOGProxy,
  type OGFetchOptions,
  type OGProxyOptions,
} from "../server/og-utils.js";

/**
 * Ready-made Open Graph route handlers for the App Router, with SSRF
 * protection built in. Each factory returns `{ GET }`, so a route file is two
 * lines:
 *
 *     // app/api/og/fetch/route.ts
 *     import { createOgFetchRoute } from "@once-ui-system/core/next";
 *     export const { GET } = createOgFetchRoute();
 *
 *     // app/api/og/proxy/route.ts
 *     import { createOgProxyRoute } from "@once-ui-system/core/next";
 *     export const { GET } = createOgProxyRoute();
 *
 * They answer exactly what `OgCard` and `useOgData` request, at the paths
 * those default to (`/api/og/fetch`, `/api/og/proxy`); mount them elsewhere
 * and tell the client with `OgRoutesProvider`.
 *
 * Both need the Node.js runtime (the default for route handlers). They only
 * request public addresses: every URL and every redirect target is checked,
 * and the connection goes to the address that was checked.
 */

export type OgFetchRouteOptions = OGFetchOptions;
export type OgProxyRouteOptions = OGProxyOptions;

export interface OgRouteHandlers {
  GET: (request: Request) => Promise<Response>;
}

/**
 * `GET /api/og/fetch?url=…` → `{ url, title, description, image, faviconUrl? }`
 * as JSON, read from the page's Open Graph and meta tags. `image` and
 * `faviconUrl` are absolute URLs.
 */
export function createOgFetchRoute(options: OgFetchRouteOptions = {}): OgRouteHandlers {
  const settings = { ...options };
  return {
    GET: (request: Request) => handleOGFetch(request, settings),
  };
}

/**
 * `GET /api/og/proxy?url=…` → the image bytes, served from your origin. Only
 * image types in `allowedContentTypes` pass, up to `maxBytes`.
 */
export function createOgProxyRoute(options: OgProxyRouteOptions = {}): OgRouteHandlers {
  const settings = { ...options };
  return {
    GET: (request: Request) => handleOGProxy(request, settings),
  };
}

export { DEFAULT_OG_IMAGE_TYPES };
