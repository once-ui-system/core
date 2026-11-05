"use client";

import { useEffect, useState } from "react";
import { useOgRoutes } from "../contexts/OgRoutesProvider.js";
import { buildOgRouteUrl } from "../utils/ogRoutes.js";

interface OgData {
  title: string;
  description: string;
  image: string;
  url: string;
  faviconUrl?: string;
}

/**
 * Fetches a page's Open Graph data through the app's OG fetch route and
 * routes a cross-origin `image` and `faviconUrl` through its proxy route.
 *
 * The routes come from `customFetchUrl`/`customProxyUrl` when given, else from
 * the nearest `OgRoutesProvider`, else the defaults (`/api/og/fetch`,
 * `/api/og/proxy`).
 */
export function useOgData(url: string | null, customFetchUrl?: string, customProxyUrl?: string) {
  const [ogData, setOgData] = useState<Partial<OgData> | null>(null);
  const [loading, setLoading] = useState(!!url);
  const routes = useOgRoutes();
  const fetchRoute = customFetchUrl || routes.fetch;
  const proxyRoute = customProxyUrl || routes.proxy;

  useEffect(() => {
    const fetchOgData = async (target: string) => {
      try {
        const fetchUrl = buildOgRouteUrl(fetchRoute, { url: target });

        const response = await fetch(fetchUrl);

        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          throw new Error(`Expected JSON response, got ${contentType}`);
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.message || data.error);
        }

        // The image and the favicon both come from whatever host the page
        // names, so both load through the proxy route. The favicon used to
        // load directly: from the visitor's browser with a plain <img>, and
        // not at all through next/image unless the host was in its
        // remotePatterns.
        for (const key of ["image", "faviconUrl"] as const) {
          if (!data[key]) continue;
          try {
            const assetUrl = new URL(data[key]);
            if (assetUrl.origin !== window.location.origin) {
              data[key] = buildOgRouteUrl(proxyRoute, { url: data[key] });
            }
          } catch (e) {
            console.warn(`Could not parse the ${key} URL for proxying:`, e);
          }
        }

        setOgData(data);
      } catch (error) {
        console.error("Error fetching og data:", error);
        setOgData(null);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchOgData(url);
    } else {
      setLoading(false);
      setOgData(null);
    }
  }, [url, fetchRoute, proxyRoute]);

  return { ogData, loading };
}

export function useOgImage(url: string | null, customFetchUrl?: string, customProxyUrl?: string) {
  const { ogData, loading } = useOgData(url, customFetchUrl, customProxyUrl);
  return { ogImage: ogData?.image || null, loading };
}
