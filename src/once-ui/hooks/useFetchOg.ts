import { useState, useEffect } from "react";

interface OgData {
  title: string;
  description: string;
  image: string;
  url: string;
  faviconUrl?: string;
}

export function useOgData(url: string | null, customFetchUrl?: string) {
  const [ogData, setOgData] = useState<Partial<OgData> | null>(null);
  const [loading, setLoading] = useState(!!url);

  useEffect(() => {
    const fetchOgData = async () => {
      try {
        // Use the custom fetch URL if provided, otherwise use the default API route
        const fetchUrl = customFetchUrl 
          ? `${customFetchUrl}?url=${encodeURIComponent(url!)}` 
          : `/api/og/fetch?url=${encodeURIComponent(url!)}`;
        
        const response = await fetch(fetchUrl);
        const data = await response.json();

        if (data.error) {
          throw new Error(data.message || data.error);
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
  }, [url]);

  return { ogData, loading };
}

export function useOgImage(url: string | null, customFetchUrl?: string) {
  const { ogData, loading } = useOgData(url, customFetchUrl);
  return { ogImage: ogData?.image || null, loading };
}
