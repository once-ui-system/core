/**
 * Which of a set of hrefs a pathname is currently on.
 *
 * A sidebar cannot decide this with `pathname === href`, because a nested
 * route (`/settings/billing/invoices`) is on none of its links, and it cannot
 * use `startsWith` either, because `/settings` is a prefix of every one of its
 * children and would light up alongside them. The answer is the *longest*
 * href that matches, which is the one lower in the tree.
 *
 * Lifted out of a product sidebar where it had been written once and copied
 * nowhere — every other sidebar in the fleet got the highlight subtly wrong.
 *
 * ```ts
 * const hrefs = items.map((i) => i.href);
 * const current = selectNavHref(pathname, hrefs);
 * // then: selected={item.href === current}
 * ```
 */
function selectNavHref(pathname: string, hrefs: string[]): string | null {
  const matches = hrefs.filter((href) => pathname === href || pathname.startsWith(`${href}/`));
  if (matches.length === 0) return null;
  return matches.reduce((a, b) => (a.length >= b.length ? a : b));
}

export { selectNavHref };
