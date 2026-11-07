"use client";

import type React from "react";
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * The plumbing a menu shares with the Submenus inside it. Internal: Dropdown
 * and the context menu provide it, Submenu reads it.
 *
 * A menu is a tree of panels: the root (a Dropdown's or a context menu's
 * panel) and one panel per open Submenu, each portalled to the body. Every
 * panel is a "level", and at most one Submenu is open per level.
 */

/** Read by every panel in one menu tree. */
export interface MenuRoot {
  /** Marks every panel of the tree (`data-menu-tree`), so a hover-opened
   *  root can tell that the pointer is still inside one of its submenus. */
  treeId: string;
  /** A Submenu calls this on mount: the root then reads as a `menu`. */
  registerSubmenu: () => () => void;
  /** Whether the root locks page scroll; a Submenu's panel joins the lock. */
  scrollLocked: boolean;
}

export const MenuRootContext = createContext<MenuRoot | null>(null);

type Point = { x: number; y: number };

/** One panel of the tree and the Submenu open in it. */
export interface MenuLevel {
  /** The `id` of the Submenu open at this level, if any. */
  openId: string | null;
  /** Open one Submenu at this level now (closing its sibling), or none. */
  setOpenId: (id: string | null) => void;
  /**
   * Grants the pointer a path from a Submenu's trigger into its panel: a
   * polygon from where it left the trigger to the panel's near edge. While
   * it travels inside it, hovering other items at this level does not
   * switch or close the open Submenu, for up to `GRACE_MS`.
   */
  setGrace: (from: Point, panel: DOMRect) => void;
  /** Cancels any pending open or close here: the pointer reached the panel. */
  settle: () => void;
  /** How long the pointer has to rest on a Submenu trigger before it opens. */
  openDelay: number;
}

export const MenuLevelContext = createContext<MenuLevel | null>(null);

/** The longest a pointer may take to cross from a trigger to its panel. */
export const GRACE_MS = 400;
/** How long the pointer rests on another item before an open Submenu closes. */
const SWITCH_DELAY = 100;

/** The items of one level, in the order the keys move through them. */
export const MENU_ITEM_SELECTOR =
  '[data-submenu-trigger], [role="menuitem"], [role="option"], .option, [data-value]';

export const isEnabledItem = (el: Element) =>
  !el.hasAttribute("disabled") && el.getAttribute("aria-disabled") !== "true";

/** Ray casting: whether `p` is inside `polygon`. */
export function pointInPolygon(p: Point, polygon: Point[]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * The safe path from `from` (where the pointer left the trigger) to a panel:
 * a wedge opening from that point onto the panel's near edge, and the panel
 * itself. Pulled a few pixels back behind `from`, so the first move out of
 * the trigger already falls inside.
 */
export function gracePolygon(from: Point, panel: DOMRect): Point[] {
  const toRight = panel.left >= from.x - 1;
  const back = toRight ? -5 : 5;
  const near = toRight ? panel.left : panel.right;
  const far = toRight ? panel.right : panel.left;
  return [
    { x: from.x + back, y: from.y - 5 },
    { x: near, y: panel.top - 4 },
    { x: far, y: panel.top - 4 },
    { x: far, y: panel.bottom + 4 },
    { x: near, y: panel.bottom + 4 },
    { x: from.x + back, y: from.y + 5 },
  ];
}

/**
 * One level's state and its pointer handling. `onPointerMove` goes on the
 * level's panel: it opens the Submenu whose trigger the pointer rests on,
 * and closes the open one when the pointer settles on another item, unless
 * the pointer is on its way into that Submenu's panel.
 */
export function useMenuLevel({ openDelay = 100 }: { openDelay?: number } = {}) {
  const [openId, setOpenIdState] = useState<string | null>(null);
  const openIdRef = useRef(openId);
  openIdRef.current = openId;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const grace = useRef<{ polygon: Point[]; until: number } | null>(null);
  const graceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Where the pointer last was over this level, re-read when a grace runs out. */
  const last = useRef<{ point: Point; target: Element } | null>(null);
  const container = useRef<HTMLElement | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const setOpenId = useCallback(
    (id: string | null) => {
      clearTimer();
      grace.current = null;
      setOpenIdState(id);
    },
    [clearTimer],
  );

  /** What the pointer resting on `target` means for this level. */
  const evaluate = useCallback(
    (target: Element) => {
      const item = target.closest(MENU_ITEM_SELECTOR);
      const submenuId =
        item && container.current?.contains(item) && isEnabledItem(item)
          ? item.getAttribute("data-submenu-trigger")
          : null;
      if (submenuId) {
        if (submenuId === openIdRef.current) {
          clearTimer();
          return;
        }
        clearTimer();
        timer.current = setTimeout(() => setOpenId(submenuId), openDelay);
        return;
      }
      // Off any Submenu trigger: an item, a divider, the padding. Close the
      // open Submenu once the pointer has settled here, not as it passes.
      if (openIdRef.current === null) {
        clearTimer();
        return;
      }
      if (!timer.current) {
        timer.current = setTimeout(() => setOpenId(null), SWITCH_DELAY);
      }
    },
    [clearTimer, openDelay, setOpenId],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (event.pointerType === "touch") return;
      // React bubbles events through portals: a move over a Submenu's own
      // panel arrives here too, and belongs to that panel's level.
      const target = event.target as Element;
      if (!event.currentTarget.contains(target)) return;
      container.current = event.currentTarget;
      const point = { x: event.clientX, y: event.clientY };
      last.current = { point, target };

      const g = grace.current;
      if (g) {
        if (Date.now() < g.until && pointInPolygon(point, g.polygon)) return;
        grace.current = null;
      }
      evaluate(target);
    },
    [evaluate],
  );

  const setGrace = useCallback(
    (from: Point, panel: DOMRect) => {
      clearTimer();
      grace.current = { polygon: gracePolygon(from, panel), until: Date.now() + GRACE_MS };
      if (graceTimer.current) clearTimeout(graceTimer.current);
      // A pointer that stops inside the wedge, over another item, would
      // otherwise keep the Submenu open for good.
      graceTimer.current = setTimeout(() => {
        if (!grace.current) return;
        grace.current = null;
        if (last.current) evaluate(last.current.target);
      }, GRACE_MS);
    },
    [clearTimer, evaluate],
  );

  const settle = useCallback(() => {
    clearTimer();
    grace.current = null;
  }, [clearTimer]);

  useEffect(
    () => () => {
      clearTimer();
      if (graceTimer.current) clearTimeout(graceTimer.current);
    },
    [clearTimer],
  );

  const level = useMemo<MenuLevel>(
    () => ({ openId, setOpenId, setGrace, settle, openDelay }),
    [openId, setOpenId, setGrace, settle, openDelay],
  );

  return { level, onPointerMove };
}

/**
 * Typeahead: typing a printable character moves to the next item whose text
 * starts with what was typed in the last half second. One character repeated
 * cycles through the items that start with it, as a native menu does.
 */
export function useTypeahead() {
  const buffer = useRef("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return useCallback((event: React.KeyboardEvent | KeyboardEvent, items: HTMLElement[]) => {
    const { key } = event;
    if (key.length !== 1 || key === " " || event.ctrlKey || event.metaKey || event.altKey) {
      return null;
    }
    const target = event.target as HTMLElement | null;
    if (target?.closest('input, textarea, select, [contenteditable="true"]')) return null;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      buffer.current = "";
    }, 500);
    buffer.current += key.toLowerCase();

    const query = buffer.current;
    const repeated = query.length > 1 && [...query].every((c) => c === query[0]);
    const search = repeated ? query[0] : query;

    const active = items.indexOf(document.activeElement as HTMLElement);
    // A fresh search starts after the current item; a longer one keeps
    // matching the current item first, so "s", "se" stays on "Settings".
    const start = search.length === 1 ? active + 1 : Math.max(active, 0);
    for (let i = 0; i < items.length; i++) {
      const item = items[(start + i) % items.length];
      if (!isEnabledItem(item)) continue;
      const text = (item.textContent ?? "").trim().toLowerCase();
      if (text.startsWith(search)) return item;
    }
    return null;
  }, []);
}
