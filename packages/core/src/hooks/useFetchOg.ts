"use client";

import { useEffect, useState } from "react";

interface OgData {
  title: string;
  description: string;
  image: string;
  url: string;
  faviconUrl?: string;
}

export function useOgData(url: string | null, customFetchUrl?: string, customProxyUrl?: string) {
  const [ogData, setOgData] = useState<Partial<OgData> | null>(null);
  const [loading, setLoading] = useState(!!url);

  useEffect(() => {
    const fetchOgData = async () => {
      try {
        const fetchUrl = customFetchUrl
          ? `${customFetchUrl}?url=${encodeURIComponent(url!)}`
          : `/api/og/fetch?url=${encodeURIComponent(url!)}`;

        const response = await fetch(fetchUrl);

        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(`Expected JSON response, got ${contentType}`);
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.message || data.error);
        }

        if (data.image) {
          try {
            const imageUrl = new URL(data.image);
            if (imageUrl.origin !== window.location.origin) {
              const proxyUrl = customProxyUrl
                ? `${customProxyUrl}?url=${encodeURIComponent(data.image)}`
                : `/api/og/proxy?url=${encodeURIComponent(data.image)}`;
              data.image = proxyUrl;
            }
          } catch (e) {
            console.warn("Could not parse image URL for proxying:", e);
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
      fetchOgData();
    } else {
      setLoading(false);
      setOgData(null);
    }
  }, [url, customFetchUrl, customProxyUrl]);

  return { ogData, loading };
}

export function useOgImage(url: string | null, customFetchUrl?: string, customProxyUrl?: string) {
  const { ogData, loading } = useOgData(url, customFetchUrl, customProxyUrl);
  return { ogImage: ogData?.image || null, loading };
}
