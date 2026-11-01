/**
 * The drag engine behind Sortable.
 *
 * One drag runs at a time, so the session is module state rather than React
 * state: a pointer move or an animation frame never re-renders the list. The
 * lists register themselves here, and a drag reads their items from the DOM
 * in document order, so the engine never holds a second copy of the order.
 *
 * Moving rows is done with transforms on the real elements, and the row being
 * dragged is a clone on `document.body`. A clone, because the row usually
 * sits inside something that clips it (an Accordion, a scroll container), and
 * dragging it to another list would cut it off at that edge.
 */

export type SortableDirection = "column" | "row";

/** Where a row sits: the list's `name` and its index in that list. */
export interface SortablePosition {
  list: string;
  index: number;
}

/** What a screen reader hears. `list` is set only when the row changes list. */
export interface SortableAnnouncement {
  item: string;
  position: number;
  total: number;
  list?: string;
}

export interface SortableLabels {
  /** Read after a row's own name, so a keyboard user knows how to move it. */
  instructions: string;
  /** The grip's name. */
  handle: (item?: string) => string;
  lifted: (a: SortableAnnouncement) => string;
  moved: (a: SortableAnnouncement) => string;
  dropped: (a: SortableAnnouncement) => string;
  cancelled: (a: SortableAnnouncement) => string;
}

export const DEFAULT_SORTABLE_LABELS: SortableLabels = {
  instructions:
    "Press Space to pick up. Use the arrow keys to move, Space to drop and Escape to cancel.",
  handle: (item) => (item ? `Reorder ${item}` : "Reorder"),
  lifted: ({ item, position, total }) => `Picked up ${item}, ${position} of ${total}.`,
  moved: ({ item, position, total, list }) =>
    `${item}, ${position} of ${total}${list ? ` in ${list}` : ""}.`,
  dropped: ({ item, position, total, list }) =>
    `Dropped ${item} at ${position} of ${total}${list ? ` in ${list}` : ""}.`,
  cancelled: ({ item, position, total }) =>
    `Cancelled. ${item} is back at ${position} of ${total}.`,
};

/** A list as the engine sees it. Its getters read the latest props. */
export interface SortableList {
  el: HTMLElement;
  name: () => string;
  group: () => string;
  direction: () => SortableDirection;
  label: () => string | undefined;
  disabled: () => boolean;
  handle: () => boolean;
  labels: () => SortableLabels;
  reorder: (id: string, from: number, to: number) => void;
  move?: () => ((id: string, to: SortablePosition, from: SortablePosition) => void) | undefined;
}

const lists = new Set<SortableList>();

export function registerList(list: SortableList) {
  lists.add(list);
  return () => {
    lists.delete(list);
    // A list leaving mid-drag: the row goes home, or the drag ends with it.
    if (!session || session.settling) return;
    if (session.source === list) finish(false);
    else if (session.target === list) {
      session.target = session.source;
      session.targetIndex = session.sourceIndex;
    }
  };
}

/** Moves one entry of a copy of `items` from `from` to `to`. */
export function arrayMove<T>(items: readonly T[], from: number, to: number): T[] {
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

const PRESS_DELAY = 200;
const DRAG_THRESHOLD = 4;
/** How far a finger may wander during the press before it counts as a scroll. */
const PRESS_TOLERANCE = 8;
const OPEN_DELAY = 400;
const EDGE = 48;
const DROP_MS = 150;

const listOf = (item: HTMLElement) =>
  [...lists].find((list) => list.el === item.closest("[data-sortable-list]"));

function itemsOf(list: SortableList): HTMLElement[] {
  return Array.from(list.el.querySelectorAll<HTMLElement>("[data-sortable-id]")).filter(
    (item) => item.closest("[data-sortable-list]") === list.el,
  );
}

const isShown = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
};

/** The lists a row can travel to from `list`, in document order. */
function groupOf(list: SortableList): SortableList[] {
  const group = list.group();
  return [...lists]
    .filter((other) => other.group() === group && !other.disabled() && isShown(other.el))
    .sort((a, b) =>
      a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    );
}

interface Box {
  el: HTMLElement;
  /** Start and end along the list's axis, in viewport pixels, ignoring transforms. */
  start: number;
  end: number;
}

interface Layout {
  boxes: Box[];
  gap: number;
  /** Where a first row would start in an empty list. */
  contentStart: number;
  /** The list's content box across its axis, for the drop line. */
  crossStart: number;
  crossSize: number;
}

/**
 * Where each row of a list sits without the transforms a drag puts on it.
 * getBoundingClientRect would include them, and mid-transition it returns
 * wherever the animation has got to, so offsets are walked instead. The list
 * is `position: relative`, which makes it the rows' offset parent.
 */
function measure(list: SortableList, skip?: HTMLElement): Layout {
  const vertical = list.direction() === "column";
  const el = list.el;
  const rect = el.getBoundingClientRect();
  const style = window.getComputedStyle(el);
  const originX = rect.left + el.clientLeft - el.scrollLeft;
  const originY = rect.top + el.clientTop - el.scrollTop;
  const all = itemsOf(list).map((item) => {
    let x = 0;
    let y = 0;
    let node: HTMLElement | null = item;
    while (node && node !== el) {
      x += node.offsetLeft;
      y += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }
    const start = vertical ? originY + y : originX + x;
    return { el: item, start, end: start + (vertical ? item.offsetHeight : item.offsetWidth) };
  });
  const parsedGap = Number.parseFloat(vertical ? style.rowGap : style.columnGap);
  const gap = all.length > 1 ? Math.max(0, all[1].start - all[0].end) : parsedGap || 0;
  const padStart = Number.parseFloat(vertical ? style.paddingTop : style.paddingLeft) || 0;
  const padCrossStart = Number.parseFloat(vertical ? style.paddingLeft : style.paddingTop) || 0;
  const padCrossEnd = Number.parseFloat(vertical ? style.paddingRight : style.paddingBottom) || 0;
  return {
    boxes: all.filter((box) => box.el !== skip),
    gap,
    contentStart: (vertical ? rect.top : rect.left) + padStart,
    crossStart: (vertical ? rect.left : rect.top) + padCrossStart,
    crossSize: (vertical ? rect.width : rect.height) - padCrossStart - padCrossEnd,
  };
}

/** Every ancestor that scrolls, nearest first, ending with the page. */
function scrollersOf(el: HTMLElement): HTMLElement[] {
  const found: HTMLElement[] = [];
  const scrolls = (value: string) => value === "auto" || value === "scroll";
  for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
    const style = window.getComputedStyle(node);
    if (
      (scrolls(style.overflowY) && node.scrollHeight > node.clientHeight) ||
      (scrolls(style.overflowX) && node.scrollWidth > node.clientWidth)
    ) {
      found.push(node);
    }
  }
  found.push((document.scrollingElement as HTMLElement) ?? document.documentElement);
  return found;
}

function boundsOf(scroller: HTMLElement) {
  if (scroller === document.scrollingElement || scroller === document.documentElement) {
    return { top: 0, left: 0, bottom: window.innerHeight, right: window.innerWidth };
  }
  const rect = scroller.getBoundingClientRect();
  return {
    top: Math.max(rect.top, 0),
    left: Math.max(rect.left, 0),
    bottom: Math.min(rect.bottom, window.innerHeight),
    right: Math.min(rect.right, window.innerWidth),
  };
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

let announcer: HTMLElement | null = null;

/** Speaks through one live region shared by every list. */
export function announce(message: string) {
  if (typeof document === "undefined") return;
  if (!announcer?.isConnected) {
    announcer = document.createElement("div");
    announcer.setAttribute("aria-live", "assertive");
    announcer.setAttribute("aria-atomic", "true");
    announcer.setAttribute("data-sortable-announcer", "");
    Object.assign(announcer.style, {
      position: "absolute",
      width: "1px",
      height: "1px",
      margin: "-1px",
      padding: "0",
      overflow: "hidden",
      clip: "rect(0 0 0 0)",
      whiteSpace: "nowrap",
      border: "0",
    });
    document.body.appendChild(announcer);
  }
  // The same sentence twice in a row is not read again, so alternate a
  // trailing non-breaking space.
  announcer.textContent = announcer.textContent === message ? `${message}\u00a0` : message;
}

const labelOf = (item: HTMLElement) =>
  item.getAttribute("data-sortable-label") ||
  (item.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 80) ||
  "Item";

interface Session {
  id: string;
  item: HTMLElement;
  label: string;
  source: SortableList;
  sourceIndex: number;
  target: SortableList;
  targetIndex: number;
  mode: "pointer" | "keyboard";
  rect: DOMRect;
  start: { x: number; y: number };
  pointer: { x: number; y: number };
  clone: HTMLElement;
  line: HTMLElement;
  shifts: Map<HTMLElement, { value: number; vertical: boolean }>;
  /** Every row a transform or transition was put on, to clear at the end. */
  touched: Set<HTMLElement>;
  reduced: boolean;
  frame: number;
  hover: { el: Element | null; since: number; fired: boolean };
  settling: boolean;
  teardown: Array<() => void>;
}

let session: Session | null = null;

export const isDragging = () => session !== null && !session.settling;
export const draggingId = () => session?.id ?? null;

function makeClone(item: HTMLElement, rect: DOMRect): HTMLElement {
  const clone = item.cloneNode(true) as HTMLElement;
  clone.removeAttribute("id");
  clone.removeAttribute("data-sortable-id");
  for (const node of clone.querySelectorAll("[id]")) node.removeAttribute("id");
  for (const node of clone.querySelectorAll("[data-sortable-id]")) {
    node.removeAttribute("data-sortable-id");
  }
  clone.setAttribute("aria-hidden", "true");
  clone.setAttribute("data-sortable-clone", "");
  clone.inert = true;
  const own = window.getComputedStyle(item).borderRadius;
  const inner = item.firstElementChild
    ? window.getComputedStyle(item.firstElementChild).borderRadius
    : "";
  const radius = own && own !== "0px" ? own : inner && inner !== "0px" ? inner : "var(--radius-m)";
  Object.assign(clone.style, {
    position: "fixed",
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: "0",
    zIndex: "10000",
    pointerEvents: "none",
    boxSizing: "border-box",
    transform: "none",
    transition: "none",
    opacity: "1",
    borderRadius: radius,
    background: "var(--surface-background)",
    boxShadow: "var(--shadow-l)",
    cursor: "grabbing",
  });
  document.body.appendChild(clone);
  return clone;
}

function makeLine(): HTMLElement {
  const line = document.createElement("div");
  line.setAttribute("aria-hidden", "true");
  line.setAttribute("data-sortable-line", "");
  Object.assign(line.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: "0",
    height: "0",
    zIndex: "9999",
    pointerEvents: "none",
    borderRadius: "1px",
    background: "var(--brand-solid-strong)",
    display: "none",
  });
  document.body.appendChild(line);
  return line;
}

/** The row's length along a list's axis. */
const sizeIn = (s: Session, list: SortableList) =>
  list.direction() === "column" ? s.item.offsetHeight : s.item.offsetWidth;

/**
 * The boxes of a list as they would sit with the dragged row taken out, and
 * where each slot it could drop into starts.
 */
function slotsOf(s: Session, list: SortableList) {
  const layout = measure(list, s.item);
  const size = sizeIn(s, list);
  // In its own list, the rows after the dragged one close up behind it.
  const collapse = (index: number) =>
    list === s.source && index >= s.sourceIndex ? size + layout.gap : 0;
  const starts = layout.boxes.map((box, index) => box.start - collapse(index));
  const last = layout.boxes.length - 1;
  starts.push(
    last >= 0 ? layout.boxes[last].end - collapse(last) + layout.gap : layout.contentStart,
  );
  return { layout, size, starts };
}

function applyShifts(s: Session) {
  const next = new Map<HTMLElement, { value: number; vertical: boolean }>();
  const add = (el: HTMLElement, value: number, vertical: boolean) => {
    const prev = next.get(el)?.value ?? 0;
    next.set(el, { value: prev + value, vertical });
  };
  const source = measure(s.source);
  const sourceVertical = s.source.direction() === "column";
  const sourceSize = sizeIn(s, s.source);
  source.boxes.forEach((box, index) => {
    if (index > s.sourceIndex) add(box.el, -(sourceSize + source.gap), sourceVertical);
  });
  const target = measure(s.target, s.item);
  const targetVertical = s.target.direction() === "column";
  const targetSize = sizeIn(s, s.target);
  target.boxes.forEach((box, index) => {
    if (index >= s.targetIndex) add(box.el, targetSize + target.gap, targetVertical);
  });
  for (const el of new Set([...s.shifts.keys(), ...next.keys()])) {
    const shift = next.get(el);
    const value = shift?.value ?? 0;
    if ((s.shifts.get(el)?.value ?? 0) === value) continue;
    s.touched.add(el);
    if (!s.reduced) {
      el.style.transition =
        "transform var(--transition-duration-macro-short) var(--transition-eased)";
    }
    el.style.transform = value
      ? shift?.vertical
        ? `translate3d(0, ${value}px, 0)`
        : `translate3d(${value}px, 0, 0)`
      : "";
  }
  s.shifts = new Map([...next].filter(([, shift]) => shift.value !== 0));
}

/** The slot's place on screen: where the clone lands and the line sits. */
function slotRect(s: Session) {
  const { layout, size, starts } = slotsOf(s, s.target);
  const vertical = s.target.direction() === "column";
  const start = starts[s.targetIndex] ?? layout.contentStart;
  const cross = s.target === s.source ? (vertical ? s.rect.left : s.rect.top) : layout.crossStart;
  return { vertical, start, size, cross, layout };
}

function placeLine(s: Session) {
  const { vertical, start, size, layout } = slotRect(s);
  const middle = start + size / 2 - 1;
  const inset = 4;
  Object.assign(
    s.line.style,
    vertical
      ? {
          display: "block",
          left: `${layout.crossStart + inset}px`,
          top: `${middle}px`,
          width: `${Math.max(0, layout.crossSize - inset * 2)}px`,
          height: "2px",
        }
      : {
          display: "block",
          left: `${middle}px`,
          top: `${layout.crossStart + inset}px`,
          width: "2px",
          height: `${Math.max(0, layout.crossSize - inset * 2)}px`,
        },
  );
}

function cloneToSlot(s: Session) {
  const { vertical, start, cross } = slotRect(s);
  const x = vertical ? cross - s.rect.left : start - s.rect.left;
  const y = vertical ? start - s.rect.top : cross - s.rect.top;
  s.clone.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

/** The list under the pointer, the innermost when lists nest. */
function listAt(s: Session): SortableList | null {
  let best: SortableList | null = null;
  let bestArea = Number.POSITIVE_INFINITY;
  for (const list of groupOf(s.source)) {
    const rect = list.el.getBoundingClientRect();
    const { x, y } = s.pointer;
    // The list the row is over has opened a gap for it, which pushes its last
    // rows past its own box; count that space as the list's too.
    const grow = list === s.target ? sizeIn(s, list) + 8 : 8;
    const vertical = list.direction() === "column";
    const bottom = rect.bottom + (vertical ? grow : 8);
    const right = rect.right + (vertical ? 8 : grow);
    if (x < rect.left - 8 || x > right || y < rect.top - 8 || y > bottom) continue;
    const area = rect.width * rect.height;
    if (area < bestArea) {
      best = list;
      bestArea = area;
    }
  }
  return best;
}

function nearestSlot(s: Session, list: SortableList) {
  const { size, starts } = slotsOf(s, list);
  const vertical = list.direction() === "column";
  const center =
    (vertical ? s.pointer.y - s.start.y + s.rect.top : s.pointer.x - s.start.x + s.rect.left) +
    size / 2;
  let best = 0;
  let distance = Number.POSITIVE_INFINITY;
  starts.forEach((start, index) => {
    const d = Math.abs(start + size / 2 - center);
    if (d < distance) {
      best = index;
      distance = d;
    }
  });
  return best;
}

/**
 * Near an edge, scrolls the nearest container that can still go that way:
 * the sidebar first, then the page once the sidebar is at its end.
 */
function autoScroll(s: Session) {
  const speed = (distance: number) => Math.ceil(((EDGE - distance) / EDGE) * 16);
  const { x, y } = s.pointer;
  const row = s.target.direction() === "row";
  for (const scroller of scrollersOf(s.target.el)) {
    const bounds = boundsOf(scroller);
    let dx = 0;
    let dy = 0;
    if (y < bounds.top + EDGE && scroller.scrollTop > 0) {
      dy = -speed(Math.max(0, y - bounds.top));
    } else if (
      y > bounds.bottom - EDGE &&
      scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 1
    ) {
      dy = speed(Math.max(0, bounds.bottom - y));
    }
    if (row && x < bounds.left + EDGE && scroller.scrollLeft > 0) {
      dx = -speed(Math.max(0, x - bounds.left));
    } else if (
      row &&
      x > bounds.right - EDGE &&
      scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 1
    ) {
      dx = speed(Math.max(0, bounds.right - x));
    }
    if (dx || dy) {
      scroller.scrollBy(dx, dy);
      return;
    }
  }
}

/** Opens a collapsed group, such as a NavGroup, the pointer rests on. */
function hoverOpen(s: Session) {
  const under = document.elementFromPoint(s.pointer.x, s.pointer.y);
  const opener = under?.closest("[data-sortable-open]") ?? null;
  if (opener && s.item.contains(opener)) return;
  const now = performance.now();
  if (opener !== s.hover.el) {
    s.hover = { el: opener, since: now, fired: false };
    return;
  }
  if (opener && !s.hover.fired && now - s.hover.since >= OPEN_DELAY) {
    s.hover.fired = true;
    opener.dispatchEvent(new CustomEvent("sortableopen"));
  }
}

/** Keeps the slot in view while the keyboard walks it down a long list. */
function keepInView(s: Session) {
  const boxes = measure(s.target, s.item).boxes;
  const near = boxes[Math.min(s.targetIndex, boxes.length - 1)]?.el ?? s.target.el;
  near.scrollIntoView?.({ block: "nearest", inline: "nearest" });
}

function tick() {
  const s = session;
  if (!s || s.settling) return;
  if (s.mode === "pointer") {
    autoScroll(s);
    hoverOpen(s);
    const list = listAt(s);
    if (list) {
      s.target = list;
      s.targetIndex = nearestSlot(s, list);
    }
    s.clone.style.transform = `translate3d(${s.pointer.x - s.start.x}px, ${s.pointer.y - s.start.y}px, 0)`;
  } else {
    cloneToSlot(s);
  }
  applyShifts(s);
  placeLine(s);
  s.frame = requestAnimationFrame(tick);
}

const totalIn = (s: Session) => measure(s.target, s.item).boxes.length + 1;

const announcement = (s: Session): SortableAnnouncement => ({
  item: s.label,
  position: s.targetIndex + 1,
  total: totalIn(s),
  list: s.target !== s.source ? (s.target.label() ?? s.target.name()) : undefined,
});

function begin(
  item: HTMLElement,
  list: SortableList,
  mode: Session["mode"],
  pointer: { x: number; y: number },
) {
  const rect = item.getBoundingClientRect();
  const sourceIndex = itemsOf(list).indexOf(item);
  if (sourceIndex < 0) return null;
  const s: Session = {
    id: item.getAttribute("data-sortable-id") ?? "",
    item,
    label: labelOf(item),
    source: list,
    sourceIndex,
    target: list,
    targetIndex: sourceIndex,
    mode,
    rect,
    start: pointer,
    pointer,
    clone: makeClone(item, rect),
    line: makeLine(),
    shifts: new Map(),
    touched: new Set(),
    reduced: prefersReducedMotion(),
    frame: 0,
    hover: { el: null, since: 0, fired: false },
    settling: false,
    teardown: [],
  };
  session = s;
  item.setAttribute("data-dragging", "");
  item.style.opacity = "0";
  if (mode === "keyboard" && !s.reduced) {
    s.clone.style.transition =
      "transform var(--transition-duration-macro-short) var(--transition-eased)";
    s.clone.style.outline = "2px solid var(--brand-solid-strong)";
    s.clone.style.outlineOffset = "-2px";
  }
  document.documentElement.style.setProperty("cursor", mode === "pointer" ? "grabbing" : "");
  window.getSelection()?.removeAllRanges();
  announce(list.labels().lifted(announcement(s)));
  s.frame = requestAnimationFrame(tick);
  return s;
}

function focusTarget(item: HTMLElement): HTMLElement | null {
  const handle = item.querySelector<HTMLElement>("[data-sortable-handle]");
  if (handle && item.closest("[data-sortable-list]")?.hasAttribute("data-sortable-handles")) {
    return handle;
  }
  if (item.tabIndex >= 0) return item;
  return item.querySelector<HTMLElement>(
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
}

/** Ends the drag: commits it unless cancelled, then clears every trace once React has re-rendered. */
function finish(commit: boolean) {
  const s = session;
  if (!s || s.settling) return;
  s.settling = true;
  cancelAnimationFrame(s.frame);
  for (const undo of s.teardown) undo();

  if (!commit) {
    s.target = s.source;
    s.targetIndex = s.sourceIndex;
  }
  const moved = s.target !== s.source || s.targetIndex !== s.sourceIndex;
  const labels = s.source.labels();
  const message = announcement(s);

  const settle = () => {
    if (commit && moved) {
      if (s.target === s.source) {
        s.source.reorder(s.id, s.sourceIndex, s.targetIndex);
      } else {
        const onMove = s.target.move?.() ?? s.source.move?.();
        onMove?.(
          s.id,
          { list: s.target.name(), index: s.targetIndex },
          { list: s.source.name(), index: s.sourceIndex },
        );
      }
    }
    announce(commit ? labels.dropped(message) : labels.cancelled(message));
    // React commits a discrete event's update before the next frame, so by
    // then the rows are in their new order and the transforms can go without
    // a flash of the old one.
    requestAnimationFrame(() => {
      for (const el of s.touched) {
        el.style.transition = "none";
        el.style.transform = "";
      }
      s.item.style.opacity = "";
      s.item.removeAttribute("data-dragging");
      s.clone.remove();
      s.line.remove();
      document.documentElement.style.removeProperty("cursor");
      requestAnimationFrame(() => {
        for (const el of s.touched) el.style.transition = "";
      });
      if (session === s) session = null;
      if (s.mode === "keyboard") {
        const lists = [s.target, s.source];
        const id =
          typeof CSS !== "undefined" && CSS.escape ? CSS.escape(s.id) : s.id.replace(/"/g, '\\"');
        const selector = `[data-sortable-id="${id}"]`;
        const found = lists
          .map((list) => list.el.querySelector<HTMLElement>(selector))
          .find((el): el is HTMLElement => el !== null);
        const target = found ? focusTarget(found) : null;
        target?.focus();
      }
    });
  };

  s.line.style.display = "none";
  if (s.reduced || (s.mode === "keyboard" && commit)) {
    if (!commit) applyShifts(s);
    settle();
    return;
  }
  // Glide the clone into its slot (or home, on cancel) before committing.
  applyShifts(s);
  s.clone.style.transition = `transform ${DROP_MS}ms var(--transition-eased)`;
  cloneToSlot(s);
  window.setTimeout(settle, DROP_MS);
}

const isField = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));

/** Swallows the click a mouse drag ends with, so a dragged link does not navigate. */
function swallowClick() {
  const stop = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
  };
  window.addEventListener("click", stop, { capture: true, once: true });
  window.setTimeout(() => window.removeEventListener("click", stop, { capture: true }), 0);
}

/**
 * A press on a row. The drag starts after a 4px move with a mouse or pen, or
 * from a handle. A finger on the row itself has to rest for 200ms first, so a
 * tap still clicks and a swipe still scrolls.
 */
export function pointerDown(event: PointerEvent, item: HTMLElement) {
  if (session || event.button !== 0 || isField(event.target)) return;
  const list = listOf(item);
  if (!list || list.disabled() || item.hasAttribute("data-sortable-disabled")) return;
  const fromHandle = (event.target as HTMLElement).closest?.("[data-sortable-handle]");
  if (list.handle() && !fromHandle) return;

  const origin = { x: event.clientX, y: event.clientY };
  let last = origin;
  const longPress = event.pointerType === "touch" && !fromHandle;
  let timer = 0;
  let active: Session | null = null;

  const start = () => {
    window.clearTimeout(timer);
    active = begin(item, list, "pointer", origin);
    if (!active) return stopPending();
    active.pointer = last;
    active.teardown.push(stopPending);
  };
  const move = (e: PointerEvent) => {
    if (e.pointerId !== event.pointerId) return;
    last = { x: e.clientX, y: e.clientY };
    if (active) {
      active.pointer = last;
      return;
    }
    const distance = Math.hypot(last.x - origin.x, last.y - origin.y);
    if (longPress) {
      if (distance > PRESS_TOLERANCE) stopPending();
    } else if (distance >= DRAG_THRESHOLD) {
      start();
    }
  };
  const up = (e: PointerEvent) => {
    if (e.pointerId !== event.pointerId) return;
    if (active) {
      swallowClick();
      finish(true);
    }
    stopPending();
  };
  const cancel = (e: PointerEvent) => {
    if (e.pointerId !== event.pointerId) return;
    if (active) finish(false);
    stopPending();
  };
  const key = (e: KeyboardEvent) => {
    if (active && e.key === "Escape") {
      e.preventDefault();
      finish(false);
      stopPending();
    }
  };
  // A long press opens the context menu on Android and the callout on iOS.
  const menu = (e: Event) => {
    if (active || longPress) e.preventDefault();
  };
  function stopPending() {
    window.clearTimeout(timer);
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", cancel);
    window.removeEventListener("keydown", key, true);
    window.removeEventListener("contextmenu", menu, true);
  }
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", cancel);
  window.addEventListener("keydown", key, true);
  window.addEventListener("contextmenu", menu, true);
  if (longPress) timer = window.setTimeout(start, PRESS_DELAY);
}

/**
 * Called from a row's touchmove listener. Once a drag has started the finger
 * moves the row, not the page.
 */
export function blockScroll(event: TouchEvent) {
  if (isDragging() && event.cancelable) event.preventDefault();
}

/** Keyboard step: within the list, then on into the next or previous list of the group. */
function step(s: Session, delta: number) {
  const count = measure(s.target, s.item).boxes.length;
  const next = s.targetIndex + delta;
  if (next >= 0 && next <= count) {
    s.targetIndex = next;
  } else {
    const group = groupOf(s.source);
    const at = group.indexOf(s.target);
    const neighbour = group[at + (delta < 0 ? -1 : 1)];
    if (!neighbour) return;
    s.target = neighbour;
    s.targetIndex = delta < 0 ? measure(neighbour, s.item).boxes.length : 0;
  }
  keepInView(s);
  announce(s.source.labels().moved(announcement(s)));
}

/** Space on a row (or its handle) picks it up; the keys after that are the engine's. */
export function keyDown(event: KeyboardEvent, item: HTMLElement) {
  if (session || event.key !== " " || isField(event.target)) return false;
  const list = listOf(item);
  if (!list || list.disabled() || item.hasAttribute("data-sortable-disabled")) return false;
  const fromHandle = (event.target as HTMLElement).closest?.("[data-sortable-handle]");
  if (list.handle() && !fromHandle) return false;
  event.preventDefault();
  const rect = item.getBoundingClientRect();
  const s = begin(item, list, "keyboard", { x: rect.left, y: rect.top });
  if (!s) return false;

  // Space activates a button on keyup, so the keyups of the Space that lifts
  // and the Space that drops are both swallowed.
  const swallowSpace = (e: KeyboardEvent) => {
    if (e.key === " ") e.preventDefault();
  };
  const keys = (e: KeyboardEvent) => {
    if (session !== s || s.settling) return;
    switch (e.key) {
      case "ArrowUp":
      case "ArrowLeft":
        step(s, -1);
        break;
      case "ArrowDown":
      case "ArrowRight":
        step(s, 1);
        break;
      case " ":
      case "Enter":
        finish(true);
        break;
      case "Escape":
        finish(false);
        break;
      case "Tab":
        break;
      default:
        return;
    }
    e.preventDefault();
    e.stopPropagation();
  };
  const blur = () => {
    // Focus leaving the page or the row mid-drag drops nothing.
    window.setTimeout(() => {
      if (session === s && !s.settling && !s.item.contains(document.activeElement)) finish(false);
    }, 0);
  };
  window.addEventListener("keydown", keys, true);
  window.addEventListener("keyup", swallowSpace, true);
  s.item.addEventListener("focusout", blur);
  s.teardown.push(() => {
    window.removeEventListener("keydown", keys, true);
    s.item.removeEventListener("focusout", blur);
    // Leave the keyup swallow for the Space that dropped. The window is held
    // here, not read when the timer fires: by then a test's jsdom may be gone.
    const win = window;
    win.setTimeout(() => win.removeEventListener("keyup", swallowSpace, true), 300);
  });
  return true;
}
