"use client";

import type React from "react";
import { createContext, forwardRef, useContext, useMemo, useSyncExternalStore } from "react";

/**
 * Framework adapter layer (rfcs/2026-08-once-ui-2-architecture.md §4).
 *
 * Core components never import framework modules directly. They render/read
 * through these adapters, which default to standard DOM behavior (`<a>`,
 * `<img>`, History API) so the library works in any React app. Framework
 * packages override them — `@once-ui-system/core/next` installs the Next.js
 * implementations (next/link, next/image, next/navigation) with one provider
 * in the root layout.
 */

export interface AdapterLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children?: React.ReactNode;
}

export interface AdapterImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> {
  src: string;
  alt: string;
  /** Absolutely fill the nearest positioned ancestor (next/image `fill` semantics). */
  fill?: boolean;
  /** Eager-load and prioritize fetching (next/image `priority` semantics). */
  priority?: boolean;
  /** Skip framework image optimization. No-op for the DOM default. */
  unoptimized?: boolean;
  width?: number;
  height?: number;
}

export interface OnceUIAdapters {
  /** Renders internal links. Default: plain `<a>`. */
  Link: React.ComponentType<AdapterLinkProps & React.RefAttributes<HTMLAnchorElement>>;
  /** Renders images. Default: plain `<img>` (lazy unless `priority`). */
  Image: React.ComponentType<AdapterImageProps>;
  /** Returns the current pathname. Default: `window.location.pathname` (popstate-aware, "" on the server). */
  usePathname: () => string;
  /** Returns an imperative navigate function. Default: full-page `window.location.assign`. */
  useNavigate: () => (href: string) => void;
}

const DefaultLink = forwardRef<HTMLAnchorElement, AdapterLinkProps>(
  ({ href, children, ...props }, ref) => (
    <a href={href} ref={ref} {...props}>
      {children}
    </a>
  ),
);
DefaultLink.displayName = "AdapterDefaultLink";

const fillStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
};

const DefaultImage: React.FC<AdapterImageProps> = ({
  src,
  alt,
  fill,
  priority,
  unoptimized: _unoptimized,
  width,
  height,
  style,
  ...props
}) => (
  // biome-ignore lint/performance/noImgElement: this IS the framework-free fallback
  <img
    src={src}
    alt={alt}
    loading={priority ? "eager" : "lazy"}
    fetchPriority={priority ? "high" : undefined}
    // next/image callers pass width/height 0 and size via style — drop those.
    width={width || undefined}
    height={height || undefined}
    style={fill ? { ...fillStyle, ...style } : style}
    {...props}
  />
);

const subscribeToNavigation = (callback: () => void) => {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
};

const defaultUsePathname = (): string =>
  useSyncExternalStore(
    subscribeToNavigation,
    () => window.location.pathname,
    () => "",
  );

const defaultUseNavigate = (): ((href: string) => void) => {
  return (href: string) => {
    window.location.assign(href);
  };
};

const defaultAdapters: OnceUIAdapters = {
  Link: DefaultLink,
  Image: DefaultImage,
  usePathname: defaultUsePathname,
  useNavigate: defaultUseNavigate,
};

const AdapterContext = createContext<OnceUIAdapters>(defaultAdapters);

export interface AdapterProviderProps {
  /** Partial overrides — anything omitted keeps its DOM default. */
  adapters: Partial<OnceUIAdapters>;
  children: React.ReactNode;
}

const AdapterProvider: React.FC<AdapterProviderProps> = ({ adapters, children }) => {
  const parent = useContext(AdapterContext);
  const value = useMemo(() => ({ ...parent, ...adapters }), [parent, adapters]);
  return <AdapterContext.Provider value={value}>{children}</AdapterContext.Provider>;
};

const useAdapters = (): OnceUIAdapters => useContext(AdapterContext);

export { AdapterProvider, defaultAdapters, useAdapters };
