"use client";

import NextImage from "next/image";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { forwardRef, useCallback } from "react";
import {
  type AdapterImageProps,
  type AdapterLinkProps,
  AdapterProvider,
  type OnceUIAdapters,
} from "../contexts/AdapterProvider";
import { LayoutProvider as BaseLayoutProvider } from "../contexts/LayoutProvider";

/**
 * Next.js adapter bindings — the ONLY runtime `next/*` imports in core
 * outside modules/seo and server/ (enforced by framework-boundary.test.ts).
 * Imported via the `@once-ui-system/core/next` subpath, never the root
 * barrel, so non-Next bundlers never resolve `next/*`. This module becomes
 * the seed of `@once-ui-system/nextjs` in 2.0 Phase 4.
 */

const NextAdapterLink = forwardRef<HTMLAnchorElement, AdapterLinkProps>(
  ({ href, children, ...props }, ref) => (
    <NextLink href={href} ref={ref} {...props}>
      {children}
    </NextLink>
  ),
);
NextAdapterLink.displayName = "NextAdapterLink";

const NextAdapterImage: React.FC<AdapterImageProps> = ({ width, height, ...props }) => (
  <NextImage width={width} height={height} {...props} />
);

const useNextNavigate = (): ((href: string) => void) => {
  const router = useRouter();
  return useCallback((href: string) => router.push(href), [router]);
};

export const nextAdapters: OnceUIAdapters = {
  Link: NextAdapterLink,
  Image: NextAdapterImage,
  usePathname,
  useNavigate: useNextNavigate,
};

export interface NextAdapterProviderProps {
  children: React.ReactNode;
}

export const NextAdapterProvider: React.FC<NextAdapterProviderProps> = ({ children }) => (
  <AdapterProvider adapters={nextAdapters}>{children}</AdapterProvider>
);

/**
 * Drop-in replacement for core's `LayoutProvider`, with the Next adapters
 * already installed.
 *
 * This is the whole migration for a Next.js app on 1.8.x: change the import
 * path for `LayoutProvider`, and `SmartLink`, `Button`/`Card`/`ToggleButton`
 * with an `href`, `Media`, `Logo`, `MegaMenu` and `Kbar` keep routing through
 * next/link and next/image exactly as before. No provider is added to the tree
 * and no props change.
 *
 *     - import { LayoutProvider } from "@once-ui-system/core";
 *     + import { LayoutProvider } from "@once-ui-system/core/next";
 *
 * Detection is deliberately not attempted. The adapters include two hooks whose
 * implementations call different numbers of hooks — the DOM `useNavigate`
 * returns a closure, the Next one calls `useRouter` and `useCallback` — so
 * swapping them after mount breaks the rules of hooks. Resolution has to be
 * settled before the first render, and a browser bundle has no synchronous way
 * to conditionally resolve an optional module. An explicit import is the
 * honest, bundler-independent version of the same thing.
 *
 * Apps that already compose `AdapterProvider` themselves can keep using
 * `NextAdapterProvider` directly; this only removes the boilerplate for the
 * common case.
 */
export const LayoutProvider: React.FC<React.ComponentProps<typeof BaseLayoutProvider>> = ({
  children,
  ...props
}) => (
  <NextAdapterProvider>
    <BaseLayoutProvider {...props}>{children}</BaseLayoutProvider>
  </NextAdapterProvider>
);
