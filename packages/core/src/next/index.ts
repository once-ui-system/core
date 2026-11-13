/**
 * `@once-ui-system/core/next`.
 *
 * No `"use client"` here on purpose. The adapters module carries it, so
 * `LayoutProvider` and friends stay client components wherever they are
 * imported from, while the OG route factories stay server code that a
 * `route.ts` file can call. A directive on this index would turn
 * every export, the route factories included, into client references.
 */
export {
  LayoutProvider,
  NextAdapterProvider,
  type NextAdapterProviderProps,
  nextAdapters,
} from "./adapters.js";
export {
  createOgFetchRoute,
  createOgProxyRoute,
  DEFAULT_OG_IMAGE_TYPES,
  type OgFetchRouteOptions,
  type OgProxyRouteOptions,
  type OgRouteHandlers,
} from "./og.js";
export {
  createOgImageRoute,
  defineOgSkin,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  type OgCardProps,
  type OgFont,
  type OgImageRouteOptions,
  type OgLayout,
  type OgMascot,
  type OgMood,
  type OgSkin,
  ogImageUrl,
  ogTitleSize,
  parseOgTitle,
  readOgCard,
  renderOgCard,
} from "./ogImage.js";
export { OG_SCHEMES, type OgSchemeName } from "./ogSchemes.js";
