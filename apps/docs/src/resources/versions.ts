/**
 * The docs versions. The list lives in `versions.data.js`, which
 * next.config.mjs also reads; this file types it and adds the helpers the
 * pages use.
 */
import {
  basePath as currentBasePath,
  currentVersion as current,
  CURRENT_VERSION as currentId,
  SITE_URL,
  VERSIONS as versions,
} from "./versions.data.js";

export type VersionStatus = "stable" | "beta" | "legacy";

export interface DocsVersion {
  id: string;
  /** Shown in the picker and the beta notice. */
  label: string;
  /** npm dist-tag a reader installs this version from; none for old majors. */
  npmTag?: "latest" | "next";
  status: VersionStatus;
  /**
   * Where the version lives on the site: "" for the stable version, which is
   * the site, "/beta" or "/v1" for the others. Their builds use it as
   * `basePath`.
   */
  path: string;
  /** Where the version's own build is deployed; the site proxies `path` to it. */
  origin: string;
  /** Branch the build comes from; "Edit on GitHub" links point at it. */
  branch: string;
  /**
   * Whether a build is deployed at `origin`. An unpublished version is listed
   * but cannot be picked, so the picker never links to a site that is not up.
   */
  published: boolean;
  /**
   * Whether the build at `origin` runs under `path`, so the site can mount
   * it. Until then the picker sends readers to `origin` directly.
   */
  mounted: boolean;
  /**
   * Whether this version has the same page paths, so the picker can keep the
   * reader on the page they are on. Older versions were laid out differently
   * and open at their home page.
   */
  samePaths: boolean;
}

export const VERSIONS: DocsVersion[] = versions as DocsVersion[];
export const CURRENT_VERSION: string = currentId;
export const currentVersion: DocsVersion = current as DocsVersion;

export const stableVersion: DocsVersion =
  VERSIONS.find((v) => v.status === "stable") ?? currentVersion;

/**
 * This build's `basePath`, for the few URLs Next does not prefix itself: the
 * version's `path` once it is mounted there, "" before.
 */
export const basePath: string = currentBasePath;

/** The address of `path` in another version. */
export function versionHref(version: DocsVersion, path: string): string {
  const base = version.mounted ? `${SITE_URL}${version.path}` : version.origin;
  if (!version.samePaths) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
