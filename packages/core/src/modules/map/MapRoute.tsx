"use client";

import type { GeoJSONSource } from "maplibre-gl";
import { useEffect, useId, useMemo } from "react";
import { useMap } from "./MapContext.js";
import { tokenColor } from "./tokenColor.js";
import type { LngLat, MapTone } from "./types.js";

export interface MapRouteProps {
  /** The route, from start to end. */
  path: readonly LngLat[];
  /** The token colour family of the travelled part. Default "brand". */
  tone?: MapTone;
  /** Line width in px. Default 4. */
  width?: number;
  /**
   * How far along the route the traveller is, 0 to 1. The part behind is
   * drawn in the tone, the part ahead as a dashed neutral line. Leave it out
   * to draw the whole route in the tone.
   */
  progress?: number;
  /** Draw the whole route dashed (a planned route). Ignored with `progress`. */
  dashed?: boolean;
}

type LineFeature = {
  type: "Feature";
  properties: Record<string, never>;
  geometry: { type: "LineString"; coordinates: [number, number][] };
};

const line = (coordinates: [number, number][]): LineFeature => ({
  type: "Feature",
  properties: {},
  geometry: { type: "LineString", coordinates },
});

/** Drawn bottom to top: the casing, the dashed part ahead, the part travelled. */
const layers = ["casing", "ahead", "behind"] as const;

/** Distance between two points in metres, on a sphere. */
function metres([lng1, lat1]: LngLat, [lng2, lat2]: LngLat): number {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * Splits a path at a fraction of its length: the part travelled and the part
 * ahead, which share the split point so the two lines meet.
 */
export function splitPath(
  path: readonly LngLat[],
  progress: number,
): { behind: [number, number][]; ahead: [number, number][] } {
  const points = path.map(([lng, lat]) => [lng, lat] as [number, number]);
  if (points.length < 2) return { behind: points, ahead: [] };
  const t = Math.min(1, Math.max(0, progress));
  const legs = points.slice(1).map((point, index) => metres(points[index], point));
  const total = legs.reduce((sum, leg) => sum + leg, 0);
  let left = t * total;
  for (let index = 0; index < legs.length; index++) {
    if (left <= legs[index] || index === legs.length - 1) {
      const f = legs[index] === 0 ? 0 : Math.min(1, left / legs[index]);
      const [a, b] = [points[index], points[index + 1]];
      const at: [number, number] = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
      return {
        behind: [...points.slice(0, index + 1), at],
        ahead: [at, ...points.slice(index + 1)],
      };
    }
    left -= legs[index];
  }
  return { behind: points, ahead: [] };
}

/**
 * A route on the map in a token colour: a delivery, a run, a flight path.
 * With `progress` the part travelled is solid and the part ahead dashed.
 * It sits on a casing in the page colour so it reads on any basemap, and
 * re-adds itself when the theme swaps the basemap.
 */
const MapRoute = ({ path, tone = "brand", width = 4, progress, dashed = false }: MapRouteProps) => {
  const { map, styleVersion, theme } = useMap();
  const id = `once-ui-route-${useId().replace(/:/g, "")}`;
  const key = JSON.stringify(path);
  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` stands for `path`, which callers often rebuild every render
  const data = useMemo(() => {
    if (progress === undefined) {
      const all = path.map(([lng, lat]) => [lng, lat] as [number, number]);
      return { casing: line(all), behind: line(dashed ? [] : all), ahead: line(dashed ? all : []) };
    }
    const { behind, ahead } = splitPath(path, progress);
    return {
      casing: line(path.map(([lng, lat]) => [lng, lat] as [number, number])),
      behind: line(behind),
      ahead: line(ahead),
    };
  }, [key, progress, dashed]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: theme re-reads the token colours
  useEffect(() => {
    if (styleVersion === 0) return;
    const colors = {
      casing: tokenColor("--page-background"),
      ahead: tokenColor("--neutral-on-background-weak"),
      behind: tokenColor(`--${tone}-solid-strong`),
    };
    for (const part of layers) {
      const layerId = `${id}-${part}`;
      if (!map.getSource(layerId)) map.addSource(layerId, { type: "geojson", data: data[part] });
      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: "line",
          source: layerId,
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {},
        });
      }
      map.setPaintProperty(layerId, "line-color", colors[part]);
      map.setPaintProperty(layerId, "line-width", part === "casing" ? width + 4 : width);
      if (part === "ahead") map.setPaintProperty(layerId, "line-dasharray", [1, 2]);
    }
  }, [map, id, styleVersion, theme, tone, width]);

  useEffect(() => {
    for (const part of layers) {
      (map.getSource(`${id}-${part}`) as GeoJSONSource | undefined)?.setData(data[part]);
    }
  }, [map, id, data]);

  useEffect(
    () => () => {
      // The map may already be gone when the whole tree unmounts.
      try {
        for (const part of [...layers].reverse()) {
          const layerId = `${id}-${part}`;
          if (map.getLayer(layerId)) map.removeLayer(layerId);
          if (map.getSource(layerId)) map.removeSource(layerId);
        }
      } catch {}
    },
    [map, id],
  );

  return null;
};

MapRoute.displayName = "MapRoute";

export { MapRoute };
