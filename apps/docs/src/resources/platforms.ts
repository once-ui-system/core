import type { IconName } from "@once-ui-system/core";

/**
 * The platforms the docs cover. Each one is its own site context: the sidebar,
 * search and page-to-page navigation only show the active platform's pages.
 *
 * A platform is a content folder. Web is everything at the root of
 * `src/content`; a platform with a `root` lives in that folder only. The
 * active platform is read from the URL, so a link to a page is enough to land
 * in the right context, with nothing to store.
 */
export type PlatformId = "web" | "native";

export interface Platform {
  id: PlatformId;
  /** Shown in the switcher. Short: the switcher sits in the sidebar column. */
  label: string;
  icon: IconName;
  /** The package a reader installs for this platform. */
  packageName: string;
  /** Content folder for this platform; `undefined` is the content root. */
  root?: string;
  /** Where a reader lands when the page they were on has no counterpart. */
  home: string;
}

export const PLATFORMS: Platform[] = [
  {
    id: "web",
    label: "Web",
    icon: "computer",
    packageName: "@once-ui-system/core",
    home: "quick-start",
  },
  {
    id: "native",
    label: "React Native",
    icon: "mobile",
    packageName: "@once-ui-system/native",
    root: "native",
    home: "native/overview",
  },
];

const ROOTED = PLATFORMS.filter((p) => p.root);

export function getPlatform(id: PlatformId): Platform {
  return PLATFORMS.find((p) => p.id === id) ?? PLATFORMS[0];
}

/** The platform a content slug (no leading slash) belongs to. */
export function platformOfSlug(slug: string): Platform {
  const first = slug.replace(/^\/+/, "").split("/")[0];
  return ROOTED.find((p) => p.root === first) ?? PLATFORMS[0];
}

/** The platform a pathname belongs to. Pages outside the docs count as web. */
export function platformOfPath(pathname: string | null | undefined): Platform {
  return platformOfSlug(pathname ?? "");
}

/** Whether a top-level navigation folder is another platform's root. */
export function isPlatformRoot(folder: string): boolean {
  return ROOTED.some((p) => p.root === folder);
}

/**
 * The page on `target` that matches `slug`, for the switcher.
 *
 * Tries the same path under the target's root first (`components/button` and
 * `native/components/button`), then any target page with the same last segment
 * (`components/button` and `native/button`), then the target's home. `slugs`
 * is every content slug the site has.
 */
export function counterpartSlug(slug: string, target: Platform, slugs: string[]): string {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  const from = platformOfSlug(clean);
  if (from.id === target.id) return clean;

  // Home to home, before matching by name: "overview" is a page name both
  // platforms use for different things.
  if (clean === from.home) return target.home;

  const rest = from.root ? clean.slice(from.root.length + 1) : clean;
  const inTarget = slugs.filter((s) => platformOfSlug(s).id === target.id);
  if (!rest) return target.home;

  const samePath = target.root ? `${target.root}/${rest}` : rest;
  if (inTarget.includes(samePath)) return samePath;

  const leaf = rest.split("/").pop();
  const sameLeaf = inTarget.find((s) => s.split("/").pop() === leaf);
  return sameLeaf ?? target.home;
}
