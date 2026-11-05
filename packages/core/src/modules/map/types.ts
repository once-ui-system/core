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
/** The semantic palettes a pin or circle takes, as `tone` everywhere in 3.0. */
export type MapTone = "brand" | "accent" | "neutral" | "danger" | "warning" | "success" | "info";

/** How the map draws the earth: flat, or a globe once zoomed out. */
export type MapProjection = "mercator" | "globe";

/** The basemap's buildings: its own flat footprints, or extruded to their height. */
export type MapBuildings = "flat" | "3d";
