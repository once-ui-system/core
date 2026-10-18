/**
 * The docs versions, one deployed site per major version.
 *
 * Each version is built from its own branch against its own package, so its
 * live examples render with the components that version ships. The picker
 * moves between sites and keeps the reader on the same page.
 *
 * `CURRENT_VERSION` says which entry this build is. It is the one line a
 * version branch changes: the 3.0 branch sets it to "3".
 */
export type VersionStatus = "stable" | "beta" | "legacy";

export interface DocsVersion {
  id: string;
  /** Shown in the picker and the beta notice. */
  label: string;
  /** npm dist-tag a reader installs this version from; none for old majors. */
  npmTag?: "latest" | "next";
  status: VersionStatus;
  /** Origin of this version's docs site. */
  url: string;
  /** Branch the site is built from; "Edit on GitHub" links point at it. */
  branch: string;
  /**
   * Whether the site at `url` is deployed. An unpublished version is listed
   * but cannot be picked, so the picker never links to a site that is not up.
   */
  published: boolean;
  /**
   * Whether this site has the same page paths, so the picker can keep the
   * reader on the page they are on. Older sites were laid out differently and
   * open at their home page.
   */
  samePaths: boolean;
}

export const VERSIONS: DocsVersion[] = [
  {
    id: "3",
    label: "3.0 beta",
    npmTag: "next",
    status: "beta",
    url: "https://next.docs.once-ui.com",
    branch: "feat/3-0-breaking-cleanup",
    published: false,
    samePaths: true,
  },
  {
    id: "2",
    label: "2.x",
    npmTag: "latest",
    status: "stable",
    url: "https://docs.once-ui.com",
    branch: "main",
    published: true,
    samePaths: true,
  },
  {
    id: "1",
    label: "1.x",
    status: "legacy",
    url: "https://v1.docs.once-ui.com",
    branch: "v1",
    published: true,
    samePaths: false,
  },
];

export const CURRENT_VERSION = "2";

export const currentVersion: DocsVersion =
  VERSIONS.find((v) => v.id === CURRENT_VERSION) ?? VERSIONS[0];

export const stableVersion: DocsVersion =
  VERSIONS.find((v) => v.status === "stable") ?? currentVersion;

/** The address of `path` on another version's site. */
export function versionHref(version: DocsVersion, path: string): string {
  if (!version.samePaths) return version.url;
  return `${version.url}${path.startsWith("/") ? path : `/${path}`}`;
}
