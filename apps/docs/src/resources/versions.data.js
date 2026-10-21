/**
 * The docs versions, all served from one site.
 *
 * Each version is still its own build, from its own branch against its own
 * package, so its live examples render with the components that version
 * ships. The stable build is the site itself; every other version is
 * deployed separately and mounted under its `path` (docs.once-ui.com/beta,
 * docs.once-ui.com/v1) by a rewrite to its `origin`. A mounted build runs
 * with `basePath` set to the same path, so its links, assets and API calls
 * stay inside it. A version that is not mounted yet is served at the root of
 * its own `origin` (the 3.0 beta at next.docs.once-ui.com), so its build has
 * no `basePath`: see `basePath` below.
 *
 * This file is plain JavaScript because next.config.mjs reads it to set
 * `basePath` and the rewrites. `versions.ts` adds the types.
 *
 * `CURRENT_VERSION` says which entry this build is. It is the one line a
 * version branch changes: the 3.0 branch sets it to "3".
 */

/** The public address of the docs. Every version is reached through it. */
export const SITE_URL = process.env.NEXT_PUBLIC_DOCS_SITE_URL || "https://docs.once-ui.com";

/** @type {import("./versions").DocsVersion[]} */
export const VERSIONS = [
  {
    id: "3",
    label: "3.0 beta",
    npmTag: "next",
    status: "beta",
    path: "/beta",
    origin: "https://next.docs.once-ui.com",
    branch: "feat/3-0-breaking-cleanup",
    published: true,
    mounted: false,
    samePaths: true,
  },
  {
    id: "2",
    label: "2.x",
    npmTag: "latest",
    status: "stable",
    path: "",
    origin: SITE_URL,
    branch: "main",
    published: true,
    mounted: true,
    samePaths: true,
  },
  {
    id: "1",
    label: "1.x",
    status: "legacy",
    path: "/v1",
    origin: "https://v1.docs.once-ui.com",
    branch: "v1",
    published: true,
    mounted: true,
    samePaths: false,
  },
];

export const CURRENT_VERSION = process.env.NEXT_PUBLIC_DOCS_VERSION || "3";

export const currentVersion = VERSIONS.find((v) => v.id === CURRENT_VERSION) ?? VERSIONS[0];

/**
 * This build's `basePath`: the version's `path` once the stable site mounts
 * it there, "" while it is served at the root of its own `origin`.
 */
export const basePath = currentVersion.mounted ? currentVersion.path : "";

/**
 * Where a version's build answers. A test or preview run can point one at
 * another server with `DOCS_ORIGIN_<id>` (DOCS_ORIGIN_3=http://localhost:3001).
 */
export function originOf(version) {
  return process.env[`DOCS_ORIGIN_${version.id}`] || version.origin;
}

/**
 * The rewrites that mount the other versions under their paths. Only the
 * stable build, which owns the domain, mounts anything, and only versions
 * whose build already runs under its path.
 */
export function versionRewrites() {
  if (currentVersion.status !== "stable") return [];
  return VERSIONS.filter((v) => v.path && v.published && v.mounted).flatMap((v) => [
    { source: v.path, destination: `${originOf(v)}${v.path}` },
    { source: `${v.path}/:path*`, destination: `${originOf(v)}${v.path}/:path*` },
  ]);
}
