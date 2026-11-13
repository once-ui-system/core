import type { Middleware, MiddlewareState } from "@floating-ui/react-dom";

/** Kept clear of the viewport's edges, as Floating UI's `shift` keeps a panel. */
const EDGE = 8;

/** How much of a long list shows on each side of the option, in rows. */
const MAX_ROWS_A_SIDE = 6.5;

export interface AlignSelectedData {
  /** Whether the panel sits on its option. False means the normal placement ran. */
  applied: boolean;
  /** The aligned option's centre, from the panel's top: where it opens from. */
  originY?: number;
}

export interface AlignSelectedOptions {
  /** Off: the middleware steps aside and the panel opens as a dropdown. */
  enabled: boolean;
  /** The element the option lands on: the trigger's text, not its label or hint. */
  anchor: () => HTMLElement | null;
  /** Sizes the panel's width, as the `size` middleware does on the normal path. */
  applyWidth: (style: CSSStyleDeclaration, availableWidth: number) => void;
}

/** The first option the panel opens on: the selected one, else the first enabled one. */
const findTarget = (panel: HTMLElement) => {
  const options = Array.from(panel.querySelectorAll<HTMLElement>('[role="option"]'));
  const enabled = (el: HTMLElement) =>
    !el.hasAttribute("disabled") && el.getAttribute("aria-disabled") !== "true";
  return (
    options.find((el) => el.getAttribute("aria-selected") === "true" && enabled(el)) ??
    options.find(enabled) ??
    null
  );
};

/** The nearest ancestor of `el` inside `panel` that scrolls vertically. */
const findScroller = (el: HTMLElement, panel: HTMLElement) => {
  for (let node = el.parentElement; node && node !== panel; node = node.parentElement) {
    const overflow = getComputedStyle(node).overflowY;
    if (overflow === "auto" || overflow === "scroll") return node;
  }
  return null;
};

/**
 * Layout distance from `ancestor`'s top to `el`'s, in CSS pixels, ignoring
 * scroll. Measured with `offsetTop`, not rects: the panel scales from 0.96 as
 * it opens, and rects taken during that are short by up to 4%.
 */
const offsetWithin = (el: HTMLElement, ancestor: HTMLElement) => {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node !== ancestor) {
    top += node.offsetTop;
    const parent = node.offsetParent as HTMLElement | null;
    // The panel is positioned, so every chain from inside it stops there.
    if (!parent || !ancestor.contains(parent)) return null;
    node = parent;
  }
  return top;
};

/**
 * Opens a list with its current option sitting exactly on the trigger and the
 * others above and below it in their own order, as macOS draws a pop-up
 * button's menu. Long lists are cut to the room on each side and scrolled so
 * that option stays put.
 *
 * Runs first, and the normal placement middleware is skipped when it applies
 * (see `unlessAligned`). It steps aside, and the panel opens as a dropdown,
 * when the trigger is too close to a viewport edge to fit the option over it
 * with some context on both sides.
 */
export const alignSelected = (options: AlignSelectedOptions): Middleware => ({
  name: "alignSelected",
  fn(state: MiddlewareState) {
    const off = { data: { applied: false } satisfies AlignSelectedData };
    if (!options.enabled || typeof window === "undefined") return off;

    const panel = state.elements.floating as HTMLElement;
    const reference = state.elements.reference as Element;
    const anchor = options.anchor();
    const option = findTarget(panel);
    const scroller = option && findScroller(option, panel);
    if (!anchor || !option || !scroller) return off;

    const viewportHeight = document.documentElement.clientHeight;
    const viewportWidth = document.documentElement.clientWidth;
    const style = panel.style;
    // Width first: it decides how the rows wrap, and so how tall they are.
    options.applyWidth(style, viewportWidth - EDGE * 2);

    const optionTop = offsetWithin(option, panel);
    const scrollerTop = offsetWithin(scroller, panel);
    if (optionTop === null || scrollerTop === null) return off;

    const anchorRect = anchor.getBoundingClientRect();
    const referenceRect = reference.getBoundingClientRect();

    const rowHeight = option.offsetHeight;
    const chromeTop = scrollerTop;
    const chromeBottom = Math.max(0, panel.offsetHeight - scrollerTop - scroller.offsetHeight);
    const above = optionTop - scrollerTop;
    const below = Math.max(0, scroller.scrollHeight - above - rowHeight);

    // Where the option goes, in the viewport: centred on the anchor's text,
    // its content box, so the option's text lands on the value's. A field
    // with a floating label pads its top for the label, and its middle sits
    // above the value.
    const anchorStyle = getComputedStyle(anchor);
    const px = (value: string) => parseFloat(value) || 0;
    const padTop = px(anchorStyle.paddingTop) + px(anchorStyle.borderTopWidth);
    const padBottom = px(anchorStyle.paddingBottom) + px(anchorStyle.borderBottomWidth);
    const textCentre = anchorRect.top + padTop + (anchorRect.height - padTop - padBottom) / 2;
    const rowTop = textCentre - rowHeight / 2;
    const roomAbove = rowTop - EDGE - chromeTop;
    const roomBelow = viewportHeight - EDGE - chromeBottom - (rowTop + rowHeight);

    // At least two rows of context each way (or all there is), or it reads as
    // a panel jammed against the edge: open as a dropdown instead.
    const context = rowHeight * 2;
    if (roomAbove < Math.min(above, context) || roomBelow < Math.min(below, context)) return off;

    // A long list stops short of filling the screen: six and a half rows a
    // side at most, the half row showing there is more to scroll to.
    const sibling = (option.nextElementSibling ??
      option.previousElementSibling) as HTMLElement | null;
    const stride = sibling
      ? Math.abs(sibling.offsetTop - option.offsetTop) || rowHeight
      : rowHeight;
    const most = stride * MAX_ROWS_A_SIDE;
    const shownAbove = Math.min(above, roomAbove, most);
    const shownBelow = Math.min(below, roomBelow, most);

    style.minHeight = "";
    style.maxHeight = `${chromeTop + shownAbove + rowHeight + shownBelow + chromeBottom}px`;
    // Hide what is cut above, so the option stays on the anchor. Once per
    // open: this runs again on every render and resize, and must not undo
    // the user's own scrolling or the arrow keys'. The panel unmounts on
    // close, which clears the mark.
    if (!panel.hasAttribute("data-aligned")) {
      scroller.scrollTop = above - shownAbove;
      panel.setAttribute("data-aligned", "");
    }

    // Floating UI works in the reference's coordinates, not the viewport's.
    const toFloatingY = state.rects.reference.y - referenceRect.top;
    const toFloatingX = state.rects.reference.x - referenceRect.left;
    const width = panel.offsetWidth;
    const left = Math.min(
      Math.max(referenceRect.left, EDGE),
      Math.max(EDGE, viewportWidth - EDGE - width),
    );

    return {
      x: left + toFloatingX,
      y: rowTop - shownAbove - chromeTop + toFloatingY,
      data: {
        applied: true,
        originY: chromeTop + shownAbove + rowHeight / 2,
      } satisfies AlignSelectedData,
    };
  },
});

/** Skips a placement middleware once `alignSelected` has placed the panel. */
export const unlessAligned = (middleware: Middleware): Middleware => ({
  ...middleware,
  fn: (state) =>
    (state.middlewareData.alignSelected as AlignSelectedData | undefined)?.applied
      ? {}
      : middleware.fn(state),
});
