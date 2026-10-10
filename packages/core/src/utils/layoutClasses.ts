/**
 * Class-name helpers shared by the server layout primitives (`ServerFlex`,
 * `ServerGrid`). Each one maps a prop value onto a utility class that
 * `@once-ui-system/foundations` generates, so the two components cannot drift
 * apart on what a value means.
 */

/**
 * Overflow values that never scroll. `clip` and `visible` joined `hidden` when
 * their classes were added: none of the three shows a scrollbar, so none needs
 * the scrollbar styling that `auto` and `scroll` get.
 */
const NON_SCROLLING_OVERFLOW = new Set<unknown>(["hidden", "clip", "visible"]);

/** True when an overflow value can show a scrollbar, so `scrollbar` applies. */
export function scrollsOn(value: unknown): boolean {
  return Boolean(value) && !NON_SCROLLING_OVERFLOW.has(value);
}
