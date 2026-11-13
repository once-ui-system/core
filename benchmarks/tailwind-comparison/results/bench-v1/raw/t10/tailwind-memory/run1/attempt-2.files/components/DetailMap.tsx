"use client";

import { useEffect, useRef } from "react";
import type { Map as MlMap } from "maplibre-gl";
import { MAP_STYLE_URL } from "@/lib/data";

export function DetailMap({
  lat,
  lng,
  label,
}: {
  lat: number;
  lng: number;
  label: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let map: MlMap | null = null;

    (async () => {
      const [mod] = await Promise.all([
        import("maplibre-gl"),
        import("maplibre-gl/dist/maplibre-gl.css"),
      ]);
      if (cancelled || !containerRef.current) return;
      const lib = ((mod as unknown as { default?: typeof import("maplibre-gl") })
        .default ?? mod) as typeof import("maplibre-gl");

      map = new lib.Map({
        container: containerRef.current,
        style: MAP_STYLE_URL,
        center: [lng, lat],
        zoom: 14,
        scrollZoom: false,
        attributionControl: { compact: true },
      });
      map.addControl(
        new lib.NavigationControl({ showCompass: false }),
        "top-right",
      );

      const pin = document.createElement("span");
      pin.setAttribute("role", "img");
      pin.setAttribute("aria-label", label);
      pin.className =
        "block size-5 rounded-full border-4 border-white bg-teal-700 shadow-lg";
      new lib.Marker({ element: pin, anchor: "center" })
        .setLngLat([lng, lat])
        .addTo(map);
    })().catch(() => {
      /* map is decorative; page remains usable */
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lat, lng, label]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-stone-100"
      aria-label={label}
    />
  );
}
