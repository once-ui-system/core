import type { StyleSpecification } from "maplibre-gl";

/** A point as `[longitude, latitude]`, the order MapLibre and GeoJSON use. */
export type LngLat = [lng: number, lat: number];

/** Where the camera is. `bearing` and `pitch` default to 0. */
export interface MapViewport {
  center: LngLat;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

/** A MapLibre style: a style.json URL or the style object itself. */
export type MapStyleSource = string | StyleSpecification;

/**
 * The basemap. One source draws in both themes; a `{ light, dark }` pair
 * follows the resolved theme.
 */
export type MapStyle = MapStyleSource | { light: MapStyleSource; dark: MapStyleSource };

/** A token colour family for map shapes and pins. */
export type MapColor = "brand" | "accent" | "neutral" | "danger" | "warning" | "success" | "info";
