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
      !(element as HTMLButtonElement).disabled &&
      !(element instanceof HTMLInputElement && element.type === "hidden") &&
      isRendered(element),
  );
}
