"use client";

import { type RefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// Layout effects warn during a server render; these only matter in the browser.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** The open overlays, innermost last. Only the innermost one answers Escape. */
const openOverlays: object[] = [];

/**
 * Marks a direct child of `document.body` that stays interactive under an open
 * overlay, and whose clicks are not "outside" it: the Toaster, so a toast's
 * Undo works while a dialog is open.
 */
export const OVERLAY_EXEMPT_ATTR = "data-overlay-exempt";

export interface OverlayOptions {
  /** Whether the overlay is open. It never closes itself: `onClose` asks. */
  open: boolean;
  /** Called on Escape (when `closeOnEscape`). */
  onClose: () => void;
  /** The overlay's outermost element: the portal's child of `document.body`. */
  overlayRef: RefObject<HTMLElement | null>;
  /** Close on Escape. Off for a base Dialog, which only a stacked one sits over. */
  closeOnEscape?: boolean;
  /** The element to focus on close, instead of the one that had focus before it opened. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** How long the exit transition runs before the overlay unmounts. */
  exitMs?: number;
}

export interface OverlayState {
  /** Mounted in the browser: `document` exists, so the portal can render. */
  mounted: boolean;
  /** In the DOM: open, or still running its exit transition. */
  visible: boolean;
  /** Past its first frame: the class that runs the entrance transition. */
  entered: boolean;
  /** Whether this is the innermost open overlay, the one that answers Escape
   *  and clicks outside. Read it in an event handler, not during render. */
  isInnermost: () => boolean;
}

/**
 * The one modal overlay core Dialog (both variants) and Drawer share.
 *
 * It owns what every modal overlay needs besides its own geometry:
 * - presence: mount, enter on the next tick, leave, unmount after `exitMs`;
 * - the rest of the page made inert while open, and the overlay itself inert
 *   while it leaves. Only nodes this overlay made inert are restored, so an
 *   overlay over another one (a stacked Dialog, a Dialog from a Drawer) leaves
 *   the one beneath as it found it;
 * - focus handed back on close, and on unmount while open, to the element that
 *   had it (or `returnFocusRef`), after the page is interactive again;
 * - Escape, on the document, answered only by the innermost open overlay and
 *   never when something inside already handled it (`defaultPrevented`);
 *   `isInnermost` lets a component do the same for clicks outside.
 *
 * Tab containment and initial focus are FocusTrap's, and page scroll is
 * ScrollLock's; the components render those two themselves.
 */
export function useOverlay({
  open,
  onClose,
  overlayRef,
  closeOnEscape = true,
  returnFocusRef,
  exitMs = 300,
}: OverlayOptions): OverlayState {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(open);
  const [entered, setEntered] = useState(false);
  const returnFocusTo = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);

  // `document` exists only after mount; an overlay rendered open on the server
  // appears on the first client pass instead of throwing.
  useEffect(() => setMounted(true), []);

  // Mount, then enter on the next tick; leave, then unmount.
  useEffect(() => {
    if (open) {
      setVisible(true);
      const timer = setTimeout(() => setEntered(true), 0);
      return () => clearTimeout(timer);
    }
    setEntered(false);
    const timer = setTimeout(() => setVisible(false), exitMs);
    return () => clearTimeout(timer);
  }, [open, exitMs]);

  // A layout effect, so the page is interactive again before focus returns to it.
  useIsomorphicLayoutEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || !visible) return;
    overlay.inert = !open;
    if (!open) return;
    const madeInert: HTMLElement[] = [];
    for (const node of Array.from(document.body.children)) {
      if (
        node instanceof HTMLElement &&
        node !== overlay &&
        !node.inert &&
        !node.hasAttribute(OVERLAY_EXEMPT_ATTR)
      ) {
        node.inert = true;
        madeInert.push(node);
      }
    }
    return () => {
      for (const node of madeInert) node.inert = false;
    };
  }, [open, visible, mounted]);

  // Remember where focus was on open and give it back on close, after the
  // page is interactive again (the effect above) and before the exit finishes.
  useIsomorphicLayoutEffect(() => {
    if (open) {
      wasOpen.current = true;
      const active = document.activeElement;
      if (active instanceof HTMLElement && !overlayRef.current?.contains(active)) {
        returnFocusTo.current = active;
      }
      return;
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    const target = returnFocusRef?.current ?? returnFocusTo.current;
    returnFocusTo.current = null;
    target?.focus({ preventScroll: true });
  }, [open, returnFocusRef]);

  // Unmounted while open: still give focus back.
  const latestReturnFocusRef = useRef(returnFocusRef);
  latestReturnFocusRef.current = returnFocusRef;
  useEffect(
    () => () => {
      if (!wasOpen.current) return;
      (latestReturnFocusRef.current?.current ?? returnFocusTo.current)?.focus({
        preventScroll: true,
      });
    },
    [],
  );

  const latest = useRef({ onClose, closeOnEscape });
  latest.current = { onClose, closeOnEscape };
  const selfRef = useRef<object>({});
  useEffect(() => {
    if (!open) return;
    const self = selfRef.current;
    openOverlays.push(self);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      if (openOverlays[openOverlays.length - 1] !== self) return;
      if (!latest.current.closeOnEscape) return;
      event.preventDefault();
      latest.current.onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      const at = openOverlays.lastIndexOf(self);
      if (at >= 0) openOverlays.splice(at, 1);
    };
  }, [open]);

  const isInnermost = useCallback(
    () => openOverlays[openOverlays.length - 1] === selfRef.current,
    [],
  );

  return { mounted, visible, entered, isInnermost };
}
