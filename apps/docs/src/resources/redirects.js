/**
 * Pages that have moved.
 *
 * A docs URL is a public contract: it is indexed, linked from blog posts and
 * pasted into issues. Reorganising `src/content` changes the URL, and a page
 * that 404s loses whatever ranking it had rather than passing it on. Every
 * move therefore gets an entry here, and `scripts/check-urls.mjs` fails the
 * build if a slug disappears without one.
 *
 * `from` and `to` are slugs without the leading slash, exactly as they appear
 * in `getPages()`. Redirects are permanent (308) — that is what tells a search
 * engine to transfer the ranking rather than treat the new URL as a separate
 * page.
 */
export const movedPages = [
  // { from: "components/foo", to: "layout/foo" },
  // Renamed to ParticleFx in 2.0 and filed with the other effects.
  { from: "components/particle", to: "effects/particleFx" },
];

/**
 * Whole sections that moved, as a prefix swap.
 *
 * A reorganisation that re-homes every page under a folder would otherwise
 * need one `movedPages` entry per page — 150-odd lines that say the same
 * thing and can fall out of step with each other. One entry here covers the
 * section, expands to a single wildcard redirect, and `check-urls.mjs`
 * counts a page as redirected when a prefix covers it.
 *
 * `from` and `to` are slug prefixes without a leading slash. `to` may be
 * empty, which lifts the section to the root.
 */
export const prefixMoves = [
  // The docs are Once UI's docs; saying so again in every URL earned nothing.
  { from: "once-ui/", to: "" },
];

export const prefixMoveRedirects = prefixMoves.map(({ from, to }) => ({
  source: `/${from}:path*`,
  destination: `/${to}:path*`,
  permanent: true,
}));

/** The new slug for an old one, or null when no prefix covers it. */
export function applyPrefixMoves(slug) {
  for (const { from, to } of prefixMoves) {
    if (slug.startsWith(from)) return `${to}${slug.slice(from.length)}`;
  }
  return null;
}

/**
 * Pages that were retired rather than moved, and the off-site page that now
 * carries their content. Same reasoning as `movedPages` — the URL was public,
 * so it redirects instead of 404ing — but the destination is absolute.
 *
 * Release history lives on GitHub, generated from the repo's CHANGELOG.md,
 * which is the source of truth. The docs held a hand-maintained second copy
 * that drifted from it.
 */
export const retiredPages = [
  { from: "changelog", to: "https://github.com/once-ui-system/core/releases" },
  { from: "roadmap", to: "https://github.com/once-ui-system/core/blob/main/ROADMAP.md" },
];

export const retiredPageRedirects = retiredPages.map(({ from, to }) => ({
  source: `/${from}`,
  destination: to,
  permanent: true,
}));

/** Shape the map into the objects `next.config.mjs` needs. */
export const movedPageRedirects = movedPages.map(({ from, to }) => ({
  source: `/${from}`,
  destination: `/${to}`,
  permanent: true,
}));
