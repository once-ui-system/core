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
  // { from: "once-ui/components/foo", to: "once-ui/layout/foo" },
];

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
