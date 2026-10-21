/**
 * OpenFreeMap: OpenStreetMap vector tiles with no key, no account and no view
 * limit, commercial use included. Swapping in a keyed provider is the
 * `mapStyle` prop (plus `transformRequest` if it wants a header).
 */
export const DEFAULT_MAP_STYLE = {
  light: "https://tiles.openfreemap.org/styles/positron",
  dark: "https://tiles.openfreemap.org/styles/dark",
} as const;
