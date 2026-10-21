"use client";

import type { Map as MapLibreMap } from "maplibre-gl";
import { createContext, useContext } from "react";
import type { LngLat } from "./types";

type MapLibre = typeof import("maplibre-gl");

export interface MapContextValue {
  /** The MapLibre instance, for anything the components do not cover. */
  map: MapLibreMap;
  /**
   * The loaded `maplibre-gl` module. Markers and popups build their MapLibre
   * objects from it, so only Map.impl imports the package and an app that
   * never renders a map never resolves it.
   */
  lib: MapLibre;
  /** True when motion is reduced: camera moves jump instead of animating. */
  reducedMotion: boolean;
  /** The theme the basemap and token colours were drawn for. */
  theme: "light" | "dark";
  /** Bumps whenever a new style finished loading, so layers can re-add themselves. */
  styleVersion: number;
  /** Frames the positions, honouring reduced motion. */
  fitTo: (positions: readonly LngLat[], options?: { padding?: number; maxZoom?: number }) => void;
}

export const MapContext = createContext<MapContextValue | null>(null);

/**
 * The map these components sit in. Throws outside a `<Map>`, so a marker
 * placed elsewhere fails where it is written instead of drawing nothing.
 */
export function useMap(): MapContextValue {
  const context = useContext(MapContext);
  if (!context) throw new Error("useMap must be used inside <Map>");
  return context;
}
