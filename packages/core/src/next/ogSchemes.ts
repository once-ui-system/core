/**
 * The color schemes as sRGB hex, for Open Graph images: the image renderer
 * reads neither CSS variables nor `oklch()`. Converted from
 * `@once-ui-system/foundations` `scss/tokens/scheme.scss` (steps 200, 500, 700
 * and 900); `ogSchemes.test.ts` keeps the two in step.
 */
export const OG_SCHEMES = {
  aqua: { 200: "#081719", 500: "#0b8184", 700: "#01c7c3", 900: "#78f6e4" },
  blue: { 200: "#0d0b44", 500: "#2d69fa", 700: "#84b5fd", 900: "#cbe3fb" },
  cyan: { 200: "#0a1525", 500: "#0279be", 700: "#17c0fd", 900: "#82f1fc" },
  dusk: { 200: "#1a131a", 500: "#7d747d", 700: "#bab1ba", 900: "#e7dee7" },
  emerald: { 200: "#081816", 500: "#0a8466", 700: "#01cb90", 900: "#84f6c3" },
  gray: { 200: "#151515", 500: "#757575", 700: "#b2b2b2", 900: "#e0e0e0" },
  green: { 200: "#081810", 500: "#0a8637", 700: "#01cf38", 900: "#91f88c" },
  indigo: { 200: "#1c0b35", 500: "#7358fa", 700: "#b3a9fd", 900: "#e0defa" },
  magenta: { 200: "#250a26", 500: "#bd1de8", 700: "#dc98fd", 900: "#efd9fb" },
  mint: { 200: "#0d1917", 500: "#6a7875", 700: "#a9b8b5", 900: "#d5e5e2" },
  moss: { 200: "#111707", 500: "#478309", 700: "#54cc01", 900: "#98f789" },
  orange: { 200: "#270d0a", 500: "#db3400", 700: "#ff9964", 900: "#fddac2" },
  pink: { 200: "#280a1a", 500: "#de028e", 700: "#fd8be4", 900: "#fcd5f5" },
  red: { 200: "#2a0a10", 500: "#e90507", 700: "#ff9689", 900: "#fdd8d2" },
  rose: { 200: "#1f1212", 500: "#847273", 700: "#c2afaf", 900: "#f3dfdf" },
  sand: { 200: "#171611", 500: "#78766f", 700: "#b6b4ad", 900: "#e3e1d9" },
  slate: { 200: "#15151f", 500: "#747582", 700: "#b2b3c1", 900: "#dfe0ef" },
  violet: { 200: "#210b2b", 500: "#9745f7", 700: "#c7a2fd", 900: "#e6dcfb" },
  yellow: { 200: "#231009", 500: "#b85b02", 700: "#fe9c0b", 900: "#fede79" },
} as const;

export type OgSchemeName = keyof typeof OG_SCHEMES;
