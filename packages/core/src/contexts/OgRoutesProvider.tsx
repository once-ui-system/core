"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";
import { DEFAULT_OG_ROUTES, type OgRoutes, resolveOgRoutes } from "../utils/ogRoutes.js";

const OgRoutesContext = createContext<Readonly<OgRoutes>>(DEFAULT_OG_ROUTES);

export interface OgRoutesProviderProps {
  /** The routes that differ from the defaults (`/api/og/fetch`, `/api/og/proxy`, `/api/og/generate`). */
  routes: Partial<OgRoutes>;
  children: ReactNode;
}

/**
 * Tells `OgCard` and `useOgData` where the app serves its Open Graph routes.
 * Only needed when they are not at the default `/api/og/*` paths. A nested
 * provider inherits whatever it does not set from the one above it.
 *
 *     <OgRoutesProvider routes={{ fetch: "/og/fetch", proxy: "/og/proxy" }}>
 */
export const OgRoutesProvider = ({ routes, children }: OgRoutesProviderProps) => {
  const parent = useContext(OgRoutesContext);
  const { fetch, proxy, generate } = routes;
  const value = useMemo(
    () => resolveOgRoutes({ fetch, proxy, generate }, parent),
    [fetch, proxy, generate, parent],
  );

  return <OgRoutesContext.Provider value={value}>{children}</OgRoutesContext.Provider>;
};

/** The Open Graph routes in effect: the nearest `OgRoutesProvider`'s, or the defaults. */
export const useOgRoutes = (): Readonly<OgRoutes> => useContext(OgRoutesContext);
