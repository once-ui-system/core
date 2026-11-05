"use client";

import type { GeoJSONSource } from "maplibre-gl";
import type React from "react";
import { useEffect, useId, useMemo } from "react";
import { useMap } from "./MapContext.js";
import { tokenColor } from "./tokenColor.js";
import type { LngLat, MapColor } from "./types.js";

export interface MapCircleProps {
  position: LngLat;
  /** Radius in metres. */
  radius: number;
  /** The token colour family. Default "brand". */
  color?: MapColor;
  /** Fill opacity, 0 to 1. Default 0.2. */
  opacity?: number;
}

/** A polygon approximating a circle on the ground, 64 sides. */
type PolygonFeature = {
  type: "Feature";
  properties: Record<string, never>;
  geometry: { type: "Polygon"; coordinates: [number, number][][] };
};

function circlePolygon([lng, lat]: LngLat, metres: number): PolygonFeature {
  const earth = 6371008.8;
  const ring: [number, number][] = [];
  const dLat = (metres / earth) * (180 / Math.PI);
  const dLng = dLat / Math.cos((lat * Math.PI) / 180);
  for (let step = 0; step <= 64; step++) {
    const angle = (step / 64) * 2 * Math.PI;
    ring.push([lng + dLng * Math.cos(angle), lat + dLat * Math.sin(angle)]);
  }
  return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [ring] } };
}

/**
 * An area on the ground in a token colour: an approximate address, a
 * delivery radius. It scales with the map, unlike a marker, and re-adds
 * itself when the theme swaps the basemap.
 */
const MapCircle: React.FC<MapCircleProps> = ({
  position,
  radius,
  color = "brand",
  opacity = 0.2,
}) => {
  const { map, styleVersion, theme } = useMap();
  const id = `once-ui-circle-${useId().replace(/:/g, "")}`;
  const [lng, lat] = position;
  const data = useMemo(() => circlePolygon([lng, lat], radius), [lng, lat, radius]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: theme re-reads the token colours
  useEffect(() => {
    if (styleVersion === 0) return;
    const solid = tokenColor(`--${color}-solid-strong`);
    if (!map.getSource(id)) map.addSource(id, { type: "geojson", data });
    if (!map.getLayer(`${id}-fill`)) {
      map.addLayer({ id: `${id}-fill`, type: "fill", source: id, paint: {} });
    }
    if (!map.getLayer(`${id}-line`)) {
      map.addLayer({ id: `${id}-line`, type: "line", source: id, paint: {} });
    }
    map.setPaintProperty(`${id}-fill`, "fill-color", solid);
    map.setPaintProperty(`${id}-fill`, "fill-opacity", opacity);
    map.setPaintProperty(`${id}-line`, "line-color", solid);
    map.setPaintProperty(`${id}-line`, "line-width", 2);
  }, [map, id, styleVersion, theme, color, opacity]);

  useEffect(() => {
    (map.getSource(id) as GeoJSONSource | undefined)?.setData(data);
  }, [map, id, data]);

  useEffect(
    () => () => {
      // The map may already be gone when the whole tree unmounts.
      try {
        if (map.getLayer(`${id}-line`)) map.removeLayer(`${id}-line`);
        if (map.getLayer(`${id}-fill`)) map.removeLayer(`${id}-fill`);
        if (map.getSource(id)) map.removeSource(id);
      } catch {}
    },
    [map, id],
  );

  return null;
};

MapCircle.displayName = "MapCircle";

export { MapCircle };
