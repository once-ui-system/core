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

/** Shape the map into the objects `next.config.mjs` needs. */
export const movedPageRedirects = movedPages.map(({ from, to }) => ({
  source: `/${from}`,
  destination: `/${to}`,
  permanent: true,
}));
