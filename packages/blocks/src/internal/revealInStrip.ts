// A copy of core's internal `src/internal/revealInStrip.ts` (SegmentedControl uses the
// original). `__tests__/internal-parity.test.ts` holds the two to the same answers.

/**
 * Scroll a horizontal strip so one of its items sits clear of the scroll
 * buttons over either end: 40px, which holds a scroll button and its
 * padding, or the item's own width if it is narrower. Only the strip moves:
 * `scrollIntoView` would scroll the page too, and a control below the fold
 * would pull the page down to it on load.
 *
 * `smooth` is for a choice the visitor just made; one that arrives from
 * outside, or at mount, jumps. Reduced motion always jumps.
 */
export function revealInStrip(item: HTMLElement, strip: HTMLElement | null, smooth: boolean) {
  if (!strip || strip.scrollWidth <= strip.clientWidth) return;
  const view = strip.getBoundingClientRect();
  const box = item.getBoundingClientRect();
  const margin = Math.min(box.width, 40);
  const start = box.left - view.left;
  const end = box.right - view.left;
  const wanted =
    start < margin ? start - margin : end > view.width - margin ? end - (view.width - margin) : 0;
  // Only as far as the strip can go: at either end there is no button to clear.
  const delta = Math.max(
    -strip.scrollLeft,
    Math.min(wanted, strip.scrollWidth - strip.clientWidth - strip.scrollLeft),
  );
  if (delta === 0) return;
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  strip.scrollBy({ left: delta, behavior: smooth && !reduced ? "smooth" : "auto" });
}
