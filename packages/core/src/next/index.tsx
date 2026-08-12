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
