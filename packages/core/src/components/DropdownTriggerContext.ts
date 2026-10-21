"use client";

import { createContext, useContext, useEffect } from "react";

/**
 * What a Button or IconButton needs from the DropdownWrapper it triggers.
 *
 * Internal: not exported from the package. DropdownWrapper provides it around
 * its `trigger`, and ElementType clears it again inside any real button or
 * link, so only a button that IS the trigger sees it, never one nested inside
 * an interactive element that is.
 */
export interface DropdownTriggerState {
  /** The dropdown is open: the trigger's `aria-expanded`. */
  expanded: boolean;
  /** What opens: the trigger's `aria-haspopup`. */
  haspopup: "listbox" | "grid" | "dialog";
  /**
   * Called by a trigger that renders as a real button, so the wrapper stops
   * announcing itself as one around it. Returns the matching unregister.
   */
  register: () => () => void;
  /**
   * A combobox trigger's active option (see DropdownComboboxContext), as an
   * index into the panel's options, so the panel keeps it scrolled into view.
   * -1 for none.
   */
  setActiveIndex: (index: number) => void;
}

export const DropdownTriggerContext = createContext<DropdownTriggerState | null>(null);

/**
 * Set by a component that renders a DropdownWrapper around a combobox it owns
 * (Select, DateInput, DateRangeInput), for that one wrapper: DropdownWrapper
 * reads it and clears it again for everything inside. Internal: not exported
 * from the package.
 *
 * The combobox is the control, and owns the keyboard. Select's keeps focus
 * while the panel is open and points at the active option with
 * `aria-activedescendant`; a date field's panel is a dialog, and the picker
 * in it takes focus itself (DatePicker's `autoFocus`). So the wrapper neither
 * claims `role="button"` around it (an input inside a button is nested
 * interactive content) nor moves focus into the panel, and the panel adds no
 * listbox around the combobox's own. A context rather than a registration
 * like the Button one because it is known at render: the server markup is
 * right too.
 */
export const DropdownComboboxContext = createContext(false);

/**
 * Closes the DropdownWrapper whose panel this element is in, or null outside
 * one. Internal: lets content that is not an option (a DatePicker's Apply
 * button) close the panel it sits in without the caller wiring `isOpen`.
 */
export const DropdownCloseContext = createContext<(() => void) | null>(null);

/**
 * The dropdown this element is the trigger of, or null. A trigger that reads
 * it renders as a button, so it registers itself for as long as it does.
 */
export function useDropdownTrigger(): DropdownTriggerState | null {
  const trigger = useContext(DropdownTriggerContext);
  const register = trigger?.register;
  useEffect(() => register?.(), [register]);
  return trigger;
}

/**
 * For a combobox trigger: reports its active option to the panel while it is
 * open. Re-reported on every open, because the panel forgets it on close.
 */
export function useDropdownCombobox(activeIndex: number): void {
  const trigger = useContext(DropdownTriggerContext);
  const setActiveIndex = trigger?.setActiveIndex;
  const expanded = trigger?.expanded ?? false;
  useEffect(() => {
    if (expanded) setActiveIndex?.(activeIndex);
  }, [expanded, activeIndex, setActiveIndex]);
}

/**
 * The props a Button or IconButton adds to its ElementType when it is a
 * dropdown's trigger. Spread before the caller's own props, so an explicit
 * `type`, `aria-haspopup` or `aria-expanded` still wins.
 *
 * Why a Button with neither `onClick` nor `href` renders a div at all: it is
 * decoration inside something else that is the control. Studio puts one in a
 * clickable Card as its "Read more", Kbar and UserMenu make their own wrapper
 * focusable around one, and core's StylePanel draws one inside a
 * `role="button"` swatch. As a real button each of those would nest one
 * interactive element in another, which is invalid HTML (a hydration error for
 * a button in a button) and a second tab stop that does nothing. So that
 * default stays.
 *
 * As a DropdownWrapper trigger the same Button is the control, and as a div
 * nothing could Tab to it: the dropdown could only be opened with a mouse.
 * Apps passed `type="button"` to get a real one. Here it becomes a real
 * `<button type="button">` (the type keeps it from submitting a surrounding
 * form), with `aria-haspopup` and `aria-expanded` for what it opens.
 * ElementType clears the context inside any real button or link, so a
 * Button decorating a clickable Card that is itself the trigger stays a div.
 */
export function dropdownTriggerProps(
  trigger: DropdownTriggerState | null,
  href: string | undefined,
  onClick: unknown,
) {
  if (!trigger) return undefined;
  return {
    type: href || onClick ? undefined : "button",
    "aria-haspopup": trigger.haspopup,
    "aria-expanded": trigger.expanded,
  } as const;
}
