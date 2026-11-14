/**
 * Pointing at part of a preview: the person hovers a block in a same-origin
 * frame (or any document), clicks it, and the conversation's next message is
 * about that block. "Make this shorter" then knows what "this" is.
 *
 * Plain DOM, no React: `armElementPicker` arms one pick and returns the
 * cleanup; `markElement` outlines the picked block while it is the context.
 */

/** What the person picked, in words an assistant can use to find it again. */
export interface PickedElement {
  element: HTMLElement;
  /** `"section"` when the page is built from sections, else `"element"`. */
  kind: "section" | "element";
  /** 1-based position among the page's pickable sections; 0 for a single element. */
  index: number;
  /** How many sections the page has; 0 for a single element. */
  total: number;
  /** The block's heading, or the start of its text, trimmed to 80 characters. */
  label: string | null;
  /** The element's tag, lower case: `section`, `h2`, `img`. */
  tag: string;
}

/** Why a click picked nothing: there was nothing to point at, or the click missed it. */
export type PickMiss = "nothing" | "outside";

export interface ElementPickerOptions {
  /** Called with the picked block. */
  onPick: (picked: PickedElement) => void;
  /** Escape cancels. */
  onCancel?: () => void;
  /** A click that picked nothing, so the app can say why instead of swallowing it. */
  onMiss?: (miss: PickMiss) => void;
  /**
   * What counts as a section. Defaults to `section`: the outermost one under
   * the pointer is picked, and its position among the page's sections is
   * reported. A page with none falls back to single elements.
   */
  sectionSelector?: string;
  /** What counts as a single element when the page has no sections. */
  elementSelector?: string;
  /** Outline while hovering. Defaults to a dashed brand line. */
  hoverOutline?: string;
  /**
   * The cursor while armed, over everything in the document (links and
   * buttons included). Defaults to `selectCursor()`: an arrow with a dashed
   * selection box. Pass any CSS cursor value, such as `"crosshair"`.
   */
  cursor?: string;
}

const SECTION = "section";
const ELEMENT = "h1, h2, h3, h4, h5, h6, p, li, img, figure, blockquote, a, button, table, form";
const HOVER = "2px dashed var(--brand-solid-medium, #60a5fa)";
const MARK = "2px solid var(--brand-solid-strong, #3b82f6)";

// The arrow of the soft cursor preset, shrunk to leave room for the box.
const WEDGE =
  '<path d="M4.6 3.2 L23.4 10.2 Q25 10.8 23.5 11.9 L15.9 15.9 L11.9 23.5 Q10.8 25 10.2 23.4 L3.2 4.6 Q2.8 2.8 4.6 3.2 Z"/>';

/**
 * The select cursor: a dark arrow with a white rim and, at its foot, a
 * dashed selection box in `accent`. Reads on light and dark pages alike.
 * Returns a CSS `cursor` value with its hotspot on the arrow's tip and
 * `crosshair` as the fallback.
 */
export function selectCursor(accent = "#3b82f6"): string {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">' +
    '<defs><filter id="s" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="#000" flood-opacity=".35"/></filter></defs>' +
    `<g transform="translate(1 1) scale(.68)"><g filter="url(#s)" fill="#fff" stroke="#fff" stroke-width="3.4" stroke-linejoin="round">${WEDGE}</g><g fill="#111">${WEDGE}</g></g>` +
    '<rect x="14.5" y="14.5" width="11" height="11" rx="2.6" fill="none" stroke="#fff" stroke-width="4" filter="url(#s)"/>' +
    `<rect x="14.5" y="14.5" width="11" height="11" rx="2.6" fill="${accent}" fill-opacity=".18" stroke="${accent}" stroke-width="1.6" stroke-dasharray="2.6 2"/>` +
    "</svg>";
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 3 3, crosshair`;
}

const CURSOR_STYLE_ID = "once-ui-element-picker-cursor";

/** The page's top-level sections, top to bottom (a section inside a section is part of it). */
export function pageSections(doc: Document, selector = SECTION): HTMLElement[] {
  return Array.from(doc.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.parentElement?.closest(selector),
  );
}

function outermost(target: EventTarget | null, selector: string): HTMLElement | null {
  let found: HTMLElement | null = null;
  for (let node = target as Element | null; node; node = node.parentElement) {
    if (node instanceof HTMLElement && node.matches(selector)) found = node;
  }
  return found;
}

function labelOf(el: HTMLElement): string | null {
  const heading = el.matches("h1, h2, h3, h4, h5, h6") ? el : el.querySelector("h1, h2, h3");
  const source =
    heading?.textContent ||
    el.getAttribute("aria-label") ||
    el.getAttribute("alt") ||
    el.textContent;
  const text = source?.replace(/\s+/g, " ").trim() ?? "";
  if (!text) return null;
  return text.length > 80 ? `${text.slice(0, 79)}…` : text;
}

function setOutline(el: HTMLElement, outline: string | null) {
  el.style.outline = outline ?? "";
  el.style.outlineOffset = outline ? "-2px" : "";
}

/** A frame's document, or null when it is cross-origin or not loaded. */
export function frameDocument(frame: HTMLIFrameElement | null): Document | null {
  try {
    return frame?.contentDocument ?? null;
  } catch {
    return null;
  }
}

/**
 * Arms a document for one pick: blocks outline under the pointer, a click
 * picks one (and is kept from following links), Escape cancels. Returns the
 * cleanup that disarms it.
 */
export function armElementPicker(doc: Document, options: ElementPickerOptions): () => void {
  const sectionSelector = options.sectionSelector ?? SECTION;
  const elementSelector = options.elementSelector ?? ELEMENT;
  const hoverOutline = options.hoverOutline ?? HOVER;
  let hovered: HTMLElement | null = null;
  // A style rule, not body.style: links and buttons set their own cursor.
  const cursorStyle = doc.createElement("style");
  cursorStyle.id = CURSOR_STYLE_ID;
  cursorStyle.textContent = `*, *::before, *::after { cursor: ${options.cursor ?? selectCursor()} !important; }`;
  (doc.head ?? doc.documentElement).appendChild(cursorStyle);

  // Read on every event: the page's own links can move it without reloading the frame.
  const target = (event: Event): HTMLElement | null =>
    pageSections(doc, sectionSelector).length > 0
      ? outermost(event.target, sectionSelector)
      : ((event.target as Element | null)?.closest<HTMLElement>(elementSelector) ?? null);

  const hover = (next: HTMLElement | null) => {
    if (hovered === next) return;
    if (hovered) setOutline(hovered, null);
    hovered = next;
    if (hovered) setOutline(hovered, hoverOutline);
  };
  const onMove = (event: MouseEvent) => hover(target(event));
  const onClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const el = target(event);
    const sections = pageSections(doc, sectionSelector);
    if (!el) {
      const anything = sections.length > 0 || doc.body.querySelector(elementSelector);
      options.onMiss?.(anything ? "outside" : "nothing");
      return;
    }
    const isSection = sections.length > 0;
    options.onPick({
      element: el,
      kind: isSection ? "section" : "element",
      index: isSection ? sections.indexOf(el) + 1 : 0,
      total: isSection ? sections.length : 0,
      label: labelOf(el),
      tag: el.tagName.toLowerCase(),
    });
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") options.onCancel?.();
  };
  const host = doc.defaultView;
  const outer = typeof window !== "undefined" && window !== host ? window : null;

  doc.addEventListener("mousemove", onMove, true);
  doc.addEventListener("click", onClick, true);
  doc.addEventListener("keydown", onKey, true);
  outer?.addEventListener("keydown", onKey, true);
  return () => {
    doc.removeEventListener("mousemove", onMove, true);
    doc.removeEventListener("click", onClick, true);
    doc.removeEventListener("keydown", onKey, true);
    outer?.removeEventListener("keydown", onKey, true);
    hover(null);
    cursorStyle.remove();
  };
}

/** Outlines a picked block while it is the conversation's context; returns the cleanup. */
export function markElement(el: HTMLElement, outline = MARK): () => void {
  setOutline(el, outline);
  return () => setOutline(el, null);
}
