/**
 * The elements Tab can reach inside a container, in document order.
 *
 * A focus trap that counts an element Tab skips (one under `display: none`
 * or `visibility: hidden`, or a disabled control) sends focus nowhere: the
 * trap focuses it on open, or waits for it before wrapping. A logo rendered
 * once per theme, with the other theme's copy hidden, is the usual case.
 */
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function isRendered(element: HTMLElement): boolean {
  if (typeof element.checkVisibility === "function") {
    return element.checkVisibility({ visibilityProperty: true });
  }
  for (let node: HTMLElement | null = element; node; node = node.parentElement) {
    const style = window.getComputedStyle(node);
    if (style.display === "none") return false;
    if (node === element && style.visibility === "hidden") return false;
  }
  return true;
}

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) =>
      // The selector's `:not` only applies to its last branch, so a
      // `<button tabindex="-1">` (every cell of a roving grid but one)
      // matched, and a trap waited for focus to reach a button Tab skips.
      element.getAttribute("tabindex") !== "-1" &&
      !(element as HTMLButtonElement).disabled &&
      !(element instanceof HTMLInputElement && element.type === "hidden") &&
      isRendered(element),
  );
}

/**
 * Where Tab should go from `active` inside a trap: the next (or, with Shift,
 * previous) tabbable element in document order, wrapping at either end. Works
 * when `active` is not itself tabbable, such as a grid cell focused by an
 * arrow key, which a check for "is focus on the last element" never saw.
 */
export function nextInTrap(
  container: HTMLElement,
  active: Element | null,
  backwards: boolean,
): HTMLElement | null {
  const focusable = getFocusableElements(container);
  if (focusable.length === 0) return null;
  if (!active || !container.contains(active)) {
    return backwards ? focusable[focusable.length - 1] : focusable[0];
  }
  const following = (element: HTMLElement) =>
    element !== active &&
    Boolean(active.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING);
  if (backwards) {
    const before = focusable.filter((element) => element !== active && !following(element));
    return before.length ? before[before.length - 1] : focusable[focusable.length - 1];
  }
  return focusable.find(following) ?? focusable[0];
}
