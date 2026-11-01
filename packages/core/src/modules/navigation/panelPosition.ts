/** The least space kept between an open panel and either edge of the window. */
const VIEWPORT_MARGIN = 16;

/**
 * Where a panel starts, relative to the menu: under its trigger, moved left as
 * far as it takes to keep the panel inside the window. A panel wider than the
 * window keeps its left edge in view. Without this a wide panel under a
 * right-hand trigger ran off the screen, since nothing scrolls it back.
 */
export function clampPanelLeft(
  triggerLeft: number,
  menuLeft: number,
  width: number,
  viewportWidth: number,
  margin = VIEWPORT_MARGIN,
): number {
  const left = triggerLeft - menuLeft;
  const maxLeft = viewportWidth - margin - width - menuLeft;
  const minLeft = margin - menuLeft;
  return Math.max(minLeft, Math.min(left, maxLeft));
}
