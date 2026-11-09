// Tooltips a chart has already placed. A new one (shown after being hidden) is
// not in here, so it appears where it belongs instead of gliding in from 0,0.
const placed = new WeakSet<HTMLElement>();

/**
 * Put a chart tooltip beside the point at (x, y), in px inside `box`: right of
 * and below it, flipped to the left at the right edge and kept inside the box.
 * Once shown, a tooltip glides to each new spot (the `.tooltip` transition);
 * the first placement skips the transition.
 */
export function placeTooltip(el: HTMLElement, box: HTMLElement, x: number, y: number) {
  let left = x + 10;
  if (left + el.offsetWidth > box.clientWidth) left = Math.max(0, x - el.offsetWidth - 10);
  const top = Math.max(0, Math.min(y + 10, box.clientHeight - el.offsetHeight));
  const transform = `translate(${left}px, ${top}px)`;
  if (placed.has(el)) {
    el.style.transform = transform;
    return;
  }
  placed.add(el);
  el.style.transition = "none";
  el.style.transform = transform;
  // Commit the first position before the transition comes back.
  void el.offsetWidth;
  el.style.transition = "";
}
