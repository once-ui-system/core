"use client";

import { autoUpdate, flip, offset, shift, size, useFloating } from "@floating-ui/react-dom";
import React, {
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { NavigationLayout } from "../hooks/useArrowNavigation.js";
import { ContextMenuImpl } from "../internal/ContextMenuImpl.js";
import { DropdownPanel } from "../internal/DropdownPanel.js";
import {
  MenuLevelContext,
  type MenuRoot,
  MenuRootContext,
  useMenuLevel,
  useTypeahead,
} from "../internal/menuTree.js";
import type { CSSUnit, Placement } from "../types.js";
import {
  clearLastOpenedDropdown,
  getLastOpenedDropdown,
  setLastOpenedDropdown,
} from "../utils/dropdownState.js";
import { cssLength, declareTokenLengths } from "../utils/layoutClasses.js";
import { ArrowNavigation, useArrowNavigationContext } from "./ArrowNavigationContext.js";
import { Button } from "./Button.js";
import { Column } from "./Column.js";
import styles from "./Dropdown.module.scss";
import {
  DropdownCloseContext,
  DropdownComboboxContext,
  DropdownTriggerContext,
  type DropdownTriggerState,
} from "./DropdownTriggerContext.js";
import { Flex } from "./Flex.js";
import { FocusTrap } from "./FocusTrap.js";
import { IconButton } from "./IconButton.js";
import { Option } from "./Option.js";
import { OptionRoleContext } from "./OptionRoleContext.js";
import { Row } from "./Row.js";
import { ScrollLock } from "./ScrollLock.js";

/** A number as px, a CSS length as written. */

export interface DropdownProps {
  fillWidth?: boolean;
  /** The panel's minimum width: a number is on the token scale (`192` is 12rem), a string a CSS length. */
  minWidth?: number | CSSUnit;
  /** As `minWidth`; unset, the panel is capped at the space available. */
  maxWidth?: number | CSSUnit;
  /** The panel's minimum height: a number is on the token scale, a string a CSS length. */
  minHeight?: number | CSSUnit;
  placement?: Placement;
  /** What opens the dropdown: a Button, an IconButton, any element. With `openOn="contextmenu"`, the region a right-click opens it over. */
  trigger: ReactNode;
  /** The dropdown's content: Options, a picker, a form. */
  children?: ReactNode;
  /**
   * What opens it. `"click"` (the default) toggles it from the trigger and
   * anchors it there. `"hover"` also opens it when the pointer rests on the
   * trigger and closes it once the pointer has left both trigger and panel
   * (see `openDelay`, `closeDelay`); a click pins it open, and the keyboard
   * opens it as a click does. Touch has no hover, so a tap opens it there.
   * `"contextmenu"` opens it on right-click (or the context menu key) at the
   * pointer, as a `menu` of `menuitem`s: 2.x `ContextMenu`.
   */
  openOn?: "click" | "hover" | "contextmenu";
  /** `openOn="hover"`: how long, in ms, the pointer rests on the trigger before the panel opens. Defaults to 100. */
  openDelay?: number;
  /**
   * `openOn="hover"`: how long, in ms, the pointer may be away from the
   * trigger and its panels before the panel closes. Defaults to 300, enough to
   * cross the gap between them or overshoot an edge without losing the menu.
   */
  closeDelay?: number;
  /** `openOn="contextmenu"`: the trigger region does not open the menu, and is dimmed. */
  disabled?: boolean;
  /**
   * `openOn="contextmenu"`: no box around the trigger (`display: contents`), so
   * the menu adds nothing to layout.
   */
  contents?: boolean;
  selectedOption?: string;
  style?: React.CSSProperties;
  className?: string;
  onSelect?: (value: string) => void;
  closeAfterClick?: boolean;
  handleArrowNavigation?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  nested?: boolean;
  navigationLayout?: NavigationLayout;
  columns?: number | string;
  optionsCount?: number;
  dropdownId?: string;
  disableTriggerClick?: boolean;
  /** Capture-phase focus on the whole control, trigger and dropdown alike —
   *  the only place a consumer can see focus enter and leave the widget,
   *  since it moves between the two during a normal interaction. */
  onFocusCapture?: React.FocusEventHandler<HTMLDivElement>;
  onBlurCapture?: React.FocusEventHandler<HTMLDivElement>;
}

// Global state to track the last opened dropdown
let dropdownCounter = 0;

/** The items of the list, in the order the arrow keys move through them. */
const ITEM_SELECTOR =
  '.option, [role="option"], [role="menuitem"], [data-value], [data-submenu-trigger]';

const isEnabledOption = (el: Element) =>
  !el.hasAttribute("disabled") && el.getAttribute("aria-disabled") !== "true";

/**
 * Typeahead for the list ArrowNavigation drives: a printable key moves to the
 * next item whose text starts with what was typed. Inside ArrowNavigation, so
 * it moves the list's own focused index and the arrow keys carry on from
 * there. Listens on the panel natively, so keys from a Submenu's panel (in the
 * React tree, not the DOM) stay with that panel.
 */
const RootTypeahead = ({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const navigation = useArrowNavigationContext();
  const navigationRef = useRef(navigation);
  navigationRef.current = navigation;
  const typeahead = useTypeahead();

  useEffect(() => {
    const panel = containerRef.current;
    const list = panel?.parentElement;
    if (!panel || !list) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.defaultPrevented) return;
      // ArrowNavigation indexes the items of its own element, the panel's parent.
      const items = Array.from(list.querySelectorAll(ITEM_SELECTOR)) as HTMLElement[];
      const match = typeahead(event, items);
      if (!match) return;
      event.preventDefault();
      navigationRef.current.setFocusedIndex(items.indexOf(match));
    };
    panel.addEventListener("keydown", onKeyDown);
    return () => panel.removeEventListener("keydown", onKeyDown);
  }, [containerRef, typeahead]);

  return null;
};

const DropdownMenu = ({
  ref,
  trigger,
  onFocusCapture,
  onBlurCapture,
  dropdown,
  selectedOption,
  minHeight,
  onSelect,
  closeAfterClick = true,
  open: controlledIsOpen,
  handleArrowNavigation = true,
  onOpenChange,
  minWidth,
  maxWidth,
  fillWidth = false,
  placement = "bottom-start",
  className,
  style,
  nested = false,
  navigationLayout: propNavigationLayout,
  columns = 8,
  optionsCount: propOptionsCount,
  dropdownId: propDropdownId,
  disableTriggerClick = false,
  hover = false,
  openDelay = 100,
  closeDelay = 300,
}: (Omit<DropdownProps, "openOn" | "children" | "disabled" | "contents"> & {
  dropdown: ReactNode;
  /** `openOn="hover"`. */
  hover?: boolean;
}) & { ref?: React.Ref<HTMLDivElement> }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  /**
   * What the open panel hands focus to: its list (`"options"`), or the
   * field it leads with (`"field"`) — a switcher's or command menu's search.
   * Null until the panel has rendered and been looked at. ArrowNavigation's
   * `autoFocus` waits on it: started on positioning alone, it put focus on
   * the selected option a frame after the field had it, so the caret
   * blinked once and typing went nowhere.
   */
  const [opensOn, setOpensOn] = useState<"options" | "field" | null>(null);

  // Use provided dropdownId or generate a unique ID for this dropdown
  const dropdownId = useRef(propDropdownId || `dropdown-${dropdownCounter++}`);

  /**
   * The trigger's id. The open list is named after its trigger, as a menu
   * is after its button: "Sort by", "More actions", a month. It was named
   * "Dropdown options", in English, whatever the trigger said.
   */
  const triggerId = `${useId()}-trigger`;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  /** The portal's outermost element — FocusTrap's container. `dropdownRef`
   *  sits two levels below it (FocusTrap > ArrowNavigation > panel), and
   *  both of those levels are focusable and get focused by this component
   *  when the panel opens, so containment has to be tested from the top. */
  const portalRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  /**
   * Whether the pointer opened the panel (`openOn="hover"`) and nothing has
   * pinned it since. Such a panel is a preview: it leaves focus where it
   * was and page scroll free, and closes when the pointer moves away. A
   * click on the trigger or an arrow key turns it into an ordinary open
   * panel. Mirrored in a ref for the open effect, which must not re-run on it.
   */
  const [hoverOpened, setHoverOpenedState] = useState(false);
  const hoverOpenedRef = useRef(false);
  const setHoverOpened = useCallback((value: boolean) => {
    hoverOpenedRef.current = value;
    setHoverOpenedState(value);
  }, []);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearHoverTimer = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
  }, []);
  useEffect(() => clearHoverTimer, [clearHoverTimer]);

  /**
   * How many Submenus the panel holds. With any, the panel is a `menu` of
   * `menuitem`s rather than a `listbox` of options: a listbox cannot own a
   * popup, and screen readers announce a menu's items as having submenus.
   */
  const [submenus, setSubmenus] = useState(0);
  const registerSubmenu = useCallback(() => {
    setSubmenus((count) => count + 1);
    return () => setSubmenus((count) => count - 1);
  }, []);
  const isMenu = submenus > 0;
  const outerOptionRole = useContext(OptionRoleContext);
  const scrollLocked = isOpen && !hoverOpened;
  const menuRoot = useMemo<MenuRoot>(
    () => ({ treeId: dropdownId.current, registerSubmenu, scrollLocked }),
    [registerSubmenu, scrollLocked],
  );
  const { level: rootLevel, onPointerMove: onRootPointerMove } = useMenuLevel();
  const closeRootSubmenu = rootLevel.setOpenId;
  useEffect(() => {
    if (!isOpen) {
      closeRootSubmenu(null);
      setHoverOpened(false);
    }
  }, [isOpen, closeRootSubmenu, setHoverOpened]);

  /**
   * How many Buttons in the trigger render as real buttons (see
   * DropdownTriggerContext). While one does, it is the control and carries
   * `aria-haspopup`/`aria-expanded` itself, so the two wrappers below stop
   * claiming `role="button"`: a button inside a button is nested
   * interactive content, and announces the trigger twice.
   */
  const [buttonTriggers, setButtonTriggers] = useState(0);
  const registerButtonTrigger = useCallback(() => {
    setButtonTriggers((count) => count + 1);
    return () => setButtonTriggers((count) => count - 1);
  }, []);

  /**
   * Whether the trigger is a combobox (see DropdownComboboxContext). A
   * combobox is the control too, so the wrappers drop `role="button"` for it
   * as well; beyond that it keeps focus while the panel is open and handles
   * its own keys, so this component stays out of both. Read through a ref
   * in the effects, which must not re-run on it.
   */
  const isCombobox = useContext(DropdownComboboxContext);
  const isComboboxRef = useRef(isCombobox);
  isComboboxRef.current = isCombobox;

  /**
   * A trigger that is itself a Button or IconButton element will render as
   * a real button, which is known at render. The registration above only
   * runs after mount, so without this the server markup (and the first
   * client render) nested that button in the two `role="button"` wrappers:
   * DatePicker's month and year selectors, among others. Registration still
   * covers a Button deeper inside the trigger.
   */
  const triggerIsButton =
    React.isValidElement(trigger) && (trigger.type === Button || trigger.type === IconButton);

  const wrapperIsTrigger = buttonTriggers === 0 && !triggerIsButton && !isCombobox;

  const handleOpenChange = useCallback(
    (newIsOpen: boolean) => {
      if (newIsOpen) {
        // Close any other open dropdown before opening this one
        if (getLastOpenedDropdown() && getLastOpenedDropdown() !== dropdownId.current) {
          // Dispatch event to close other dropdowns
          const closeEvent = new CustomEvent("close-other-dropdowns", {
            detail: { exceptId: dropdownId.current },
          });
          document.dispatchEvent(closeEvent);

          // Small delay to let the other dropdown close and restore scroll first
          setTimeout(() => {
            if (!isControlled) {
              setInternalIsOpen(true);
            }
            setLastOpenedDropdown(dropdownId.current);
            onOpenChange?.(true);
          }, 50);
          return;
        }

        setLastOpenedDropdown(dropdownId.current);
      } else {
        // Clear the last opened dropdown if this one is closing
        if (getLastOpenedDropdown() === dropdownId.current) {
          clearLastOpenedDropdown();
        }
      }

      if (!isControlled) {
        setInternalIsOpen(newIsOpen);
      }

      onOpenChange?.(newIsOpen);
    },
    [onOpenChange, isControlled, nested],
  );

  // State to track if we're in a browser environment for portal rendering
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Store the reference element's width for fillWidth calculation
  const [referenceWidth, setReferenceWidth] = useState<number | null>(null);

  // We'll measure the width directly in the floating UI middleware

  const {
    x,
    y,
    strategy,
    refs,
    update,
    isPositioned,
    placement: resolvedPlacement,
  } = useFloating({
    placement: placement,
    open: isOpen,
    middleware: [
      offset(4),
      flip(),
      shift(),
      size({
        apply({ availableWidth, availableHeight, elements }) {
          const floatingStyle = elements.floating.style;

          if (fillWidth && triggerRef.current) {
            // fillWidth means exactly the trigger's width — no hidden floor.
            // A wider floor pushes the panel past the trigger on "-end"
            // placements, which reads as broken positioning.
            const w = `${triggerRef.current.getBoundingClientRect().width}px`;
            floatingStyle.width = w;
            floatingStyle.minWidth = minWidth ? cssLength(minWidth) : w;
          } else {
            // Let content determine width; only apply an explicit minWidth
            floatingStyle.width = "";
            floatingStyle.minWidth = minWidth ? cssLength(minWidth) : "";
          }

          floatingStyle.maxWidth = maxWidth ? cssLength(maxWidth) : `${availableWidth}px`;
          floatingStyle.minHeight = minHeight ? cssLength(minHeight) : "0px";
          floatingStyle.maxHeight = `${availableHeight}px`;
          declareTokenLengths(
            floatingStyle,
            floatingStyle.minWidth,
            floatingStyle.maxWidth,
            floatingStyle.minHeight,
          );
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  /**
   * Where the open animation grows from. The panel scales 0.96 -> 1, so the
   * corner this names stays put while the opposite one travels by 4% of the
   * panel's size. It has to be the edge anchored to the trigger, or the
   * panel visibly slides as it opens: measured in a browser, a 480px panel
   * on a "-start" placement drifted 48px sideways with this hardcoded to
   * "top right" in the stylesheet.
   *
   * Derived from the RESOLVED placement, not the requested one, because
   * `flip()` is in the middleware — a panel that flips above its trigger has
   * to scale from its bottom edge instead.
   */
  const transformOrigin = (() => {
    const [side, align] = (resolvedPlacement || "bottom").split("-");
    if (side === "top" || side === "bottom") {
      const y = side === "bottom" ? "top" : "bottom";
      const x = align === "start" ? "left" : align === "end" ? "right" : "center";
      return `${x} ${y}`;
    }
    const x = side === "right" ? "left" : "right";
    const y = align === "start" ? "top" : align === "end" ? "bottom" : "center";
    return `${x} ${y}`;
  })();

  /**
   * Puts the caret in a leading field once the panel can actually take it.
   * The open effect's own `focus()` runs while the panel is still
   * `visibility: hidden`, and in a browser the field stays hidden for one
   * more frame after `isPositioned`: Input transitions `all`, visibility
   * included. Retries for a few frames, and never moves focus that is
   * already inside the panel — the user may have arrowed into the list.
   */
  useEffect(() => {
    if (!isOpen || !isPositioned || opensOn !== "field") return;
    let frame = 0;
    let tries = 0;
    const focusField = () => {
      const panel = dropdownRef.current;
      if (!panel || panel.contains(document.activeElement)) return;
      const field = panel.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      field?.focus({ preventScroll: true });
      if (field && document.activeElement !== field && ++tries < 10) {
        frame = requestAnimationFrame(focusField);
      }
    };
    frame = requestAnimationFrame(focusField);
    return () => cancelAnimationFrame(frame);
  }, [isOpen, isPositioned, opensOn]);

  useImperativeHandle(ref, () => wrapperRef.current as HTMLDivElement);

  useEffect(() => {
    if (wrapperRef.current) {
      refs.setReference(wrapperRef.current);

      // Store the reference element's width for fillWidth calculation
      if (fillWidth) {
        setReferenceWidth(wrapperRef.current.getBoundingClientRect().width);
      }
    }
  }, [refs, mounted, fillWidth]);

  useEffect(() => {
    if (!mounted) {
      setMounted(true);
    }
  }, [mounted]);

  // Store the previously focused element to restore focus when dropdown closes
  const previouslyFocusedElement = useRef<Element | null>(null);
  /**
   * Set when a click outside closed the panel. Focus then stays where that
   * click put it, as it would after any other click: handing it back to the
   * trigger refocused an empty DateInput, whose label floated on and on over
   * nothing after the user had clicked away.
   */
  const closedByOutsideClickRef = useRef(false);

  // Force update when dropdown opens
  useEffect(() => {
    if (isOpen && mounted) {
      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        update();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, mounted, update]);

  /**
   * Which option the panel opens on: the selected one, else the first
   * enabled one. Deliberately the same rule `useArrowNavigation` applies to
   * its own `autoFocus` — see the long form there — so the two agree
   * instead of fighting over where focus lands. Kept here rather than
   * shared through `utils`, which is published: this is an internal detail
   * of how a panel opens, not API.
   */
  const resolveOpenIndex = useCallback((options: HTMLElement[]) => {
    const selected = options.findIndex(
      (el) => el.getAttribute("aria-selected") === "true" && isEnabledOption(el),
    );
    if (selected >= 0) return selected;
    const first = options.findIndex(isEnabledOption);
    return first >= 0 ? first : 0;
  }, []);

  /** The nearest scrollable ancestor of an option, no higher than the panel. */
  const findScroller = useCallback((option: HTMLElement | undefined) => {
    const panel = dropdownRef.current;
    if (!option || !panel) return null;
    for (let el = option.parentElement; el && panel.contains(el); el = el.parentElement) {
      if (el.scrollHeight > el.clientHeight) return el;
    }
    return null;
  }, []);

  /**
   * Bring an option into view by scrolling the panel, never the page.
   * `scrollIntoView` walks every scrollable ancestor, so opening a long
   * list on its selection would drag the document with it; this moves only
   * the nearest scroller inside the panel.
   *
   * Measured in layout pixels — `offsetTop` and `clientHeight` — rather than
   * through `getBoundingClientRect`. The panel scales from 0.96 to 1 as it
   * opens, so rects taken during that animation are up to 4% short
   * while `scrollTop` is always layout pixels: mixing the two left the
   * selected row 35px below the scrollport, just off the bottom edge.
   */
  const scrollOptionIntoView = useCallback(
    (option: HTMLElement) => {
      const scroller = findScroller(option);
      if (!scroller) return;

      let top = option.offsetTop;
      for (
        let parent = option.offsetParent as HTMLElement | null;
        parent && parent !== scroller && scroller.contains(parent);
        parent = parent.offsetParent as HTMLElement | null
      ) {
        top += parent.offsetTop;
      }

      const bottom = top + option.offsetHeight;
      if (bottom > scroller.scrollTop + scroller.clientHeight) {
        scroller.scrollTop = bottom - scroller.clientHeight;
      } else if (top < scroller.scrollTop) {
        scroller.scrollTop = top;
      }
    },
    [findScroller],
  );

  useEffect(() => {
    if (isOpen && mounted) {
      // The handler marks every click outside, open or not; only one made
      // while this panel is open counts.
      closedByOutsideClickRef.current = false;
      // Store the currently focused element before focusing the dropdown.
      // A panel the pointer opened leaves focus alone, so has none to restore.
      previouslyFocusedElement.current = hoverOpenedRef.current ? null : document.activeElement;

      requestAnimationFrame(() => {
        if (dropdownRef.current) {
          refs.setFloating(dropdownRef.current);
          update();

          // A combobox keeps focus in its field and reports its own active
          // option (setActiveIndex), which resetting here would overwrite.
          if (isComboboxRef.current) return;
          if (hoverOpenedRef.current) return;

          // Reset focus index when opening
          setFocusedIndex(-1);

          const focusableElements = Array.from(
            dropdownRef.current.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            ),
          ) as HTMLElement[];

          const optionElements = Array.from(
            dropdownRef.current.querySelectorAll(ITEM_SELECTOR),
          ) as HTMLElement[];

          const openIndex = resolveOpenIndex(optionElements);

          // A panel that leads with something other than its list — a
          // searchable Select's query field — still opens on that. Only a
          // plain list opens on its selection.
          const leadsWithOptions =
            focusableElements.length > 0 && optionElements.includes(focusableElements[0]);
          const target = leadsWithOptions ? optionElements[openIndex] : focusableElements[0];
          setOpensOn(leadsWithOptions || focusableElements.length === 0 ? "options" : "field");

          target?.focus({ preventScroll: true });

          if (optionElements.length > 0) {
            setFocusedIndex(openIndex);
            optionElements.forEach((el, i) => {
              if (i === openIndex) {
                el.classList.add("highlighted");
              } else {
                el.classList.remove("highlighted");
              }
            });
          }
        }
      });
    } else if (!isOpen) {
      // Forget where focus was. `focusedIndex` seeds ArrowNavigation's
      // `initialFocusedIndex`, which is read once at mount — leaving the
      // last session's index behind meant the next open started from it and
      // never resolved the current selection at all.
      setFocusedIndex(-1);
      setOpensOn(null);

      const closedByOutsideClick = closedByOutsideClickRef.current;
      closedByOutsideClickRef.current = false;
      if (closedByOutsideClick) {
        previouslyFocusedElement.current = null;
      } else if (previouslyFocusedElement.current) {
        // A combobox's field had focus all along, so focus that is now
        // somewhere else was put there by the user — Tab out of the field,
        // a click on another control — and stays. Only focus lost with the
        // panel (it was on an option or the search field, and fell back to
        // <body> when they unmounted) comes back to the field.
        const active = document.activeElement;
        const focusWasLost = !active || active === document.body;
        // Only try to focus if the element is still in the document
        if (
          document.contains(previouslyFocusedElement.current) &&
          (!isComboboxRef.current || focusWasLost)
        ) {
          (previouslyFocusedElement.current as HTMLElement).focus({ preventScroll: true });
        }
      }
    }
  }, [isOpen, mounted, refs, update, resolveOpenIndex]);

  /**
   * `openOn="hover"`: a panel the pointer opened closes once the pointer has
   * been away from the trigger and every panel of the menu, its Submenus'
   * included, for `closeDelay`. Read from the document rather than from leave
   * events on each element, because the Submenus' panels are portals of
   * their own: moving into one leaves the root panel without leaving the menu.
   */
  useEffect(() => {
    if (!hover || !isOpen || !hoverOpened) return;
    const treeId = dropdownId.current;
    let closeTimer: ReturnType<typeof setTimeout> | null = null;
    const cancel = () => {
      if (closeTimer) clearTimeout(closeTimer);
      closeTimer = null;
    };
    const schedule = () => {
      if (closeTimer) return;
      closeTimer = setTimeout(() => {
        closeTimer = null;
        if (hoverOpenedRef.current) handleOpenChange(false);
      }, closeDelay);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const target = event.target as Element | null;
      const inside =
        !!target &&
        (wrapperRef.current?.contains(target) ||
          portalRef.current?.contains(target) ||
          !!target.closest?.(`[data-menu-tree="${treeId}"]`));
      if (inside) cancel();
      else schedule();
    };
    // Leaving the window sends no more moves.
    const onMouseOut = (event: MouseEvent) => {
      if (!event.relatedTarget) schedule();
    };
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("mouseout", onMouseOut);
    return () => {
      cancel();
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, [hover, isOpen, hoverOpened, closeDelay, handleOpenChange]);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if the click is inside the dropdown or the wrapper
      const isClickInDropdown = dropdownRef.current && dropdownRef.current.contains(target);
      const isClickInWrapper = wrapperRef.current && wrapperRef.current.contains(target);

      // Check if the click is on a dropdown trigger (for nested dropdowns)
      const isClickOnDropdownTrigger = target.closest(".dropdown-trigger") !== null;

      // Check if the click is on the dropdown portal itself
      const isClickOnDropdownPortal = target.closest(".dropdown-portal") !== null;

      // Check if the click is on any dropdown-related element
      const isClickOnDropdownElement =
        target.closest('[data-role="dropdown-wrapper"]') !== null ||
        target.closest('[data-role="dropdown-portal"]') !== null ||
        target.closest('[data-is-dropdown="true"]') !== null;

      // Only close if the click is outside both the dropdown and the wrapper
      // and not on a nested dropdown trigger or dropdown portal
      if (
        !isClickInDropdown &&
        !isClickInWrapper &&
        !isClickOnDropdownTrigger &&
        !isClickOnDropdownPortal &&
        !isClickOnDropdownElement
      ) {
        closedByOutsideClickRef.current = true;
        handleOpenChange(false);
        setFocusedIndex(-1);
      } else {
        // If click is inside dropdown but not on an option, try to close nested dropdowns
        if (isClickInDropdown || isClickOnDropdownPortal) {
          // Try to close all other dropdown portals
          const allPortals = document.querySelectorAll('[data-role="dropdown-portal"]');

          allPortals.forEach((portal, index) => {
            if (portal !== dropdownRef.current) {
              // Try to find the dropdown wrapper that contains this portal
              const wrapper = portal.closest('[data-role="dropdown-wrapper"]');
              if (wrapper) {
                const trigger = wrapper.querySelector(".dropdown-trigger");
                if (trigger) {
                  (trigger as HTMLElement).click();
                }
              }
            }
          });
        }
      }
    },
    [handleOpenChange],
  );

  const handleFocusOut = useCallback(
    (event: FocusEvent) => {
      // `relatedTarget` is null whenever focus is lost to something that
      // cannot take it — the padding of a field, the gap between two stepper
      // buttons, a label. Treating that as "focus left the dropdown" closed
      // the panel on any click that missed a focusable target, which is what
      // made NumberInput inside a DatePicker feel like it dismissed the
      // picker. A genuine click outside is already handled by
      // handleClickOutside, so there is nothing to catch here.
      if (event.relatedTarget === null) return;

      // Check if focus moved to the dropdown or stayed in the wrapper. The
      // dropdown is portalled, so it is not a descendant of the wrapper and
      // both have to be checked.
      //
      // Tested from `portalRef`, not `dropdownRef`: the panel is wrapped by
      // FocusTrap and ArrowNavigation, each of which renders a focusable
      // container above it and focuses that container itself as the panel
      // opens. Measured in Chromium, ArrowNavigation's autoFocus timer moved
      // focus from the trigger to its container 20ms after a DatePicker's
      // month selector opened; read against `dropdownRef` that container is
      // "outside", so the panel closed itself before the user could aim at
      // anything in it.
      const isFocusInDropdown =
        portalRef.current && portalRef.current.contains(event.relatedTarget as Node);
      const isFocusInWrapper =
        wrapperRef.current && wrapperRef.current.contains(event.relatedTarget as Node);

      // Only close if focus moved outside both the dropdown and the wrapper
      if (!isFocusInDropdown && !isFocusInWrapper) {
        handleOpenChange(false);
        setFocusedIndex(-1);
      }
    },
    [handleOpenChange],
  );

  useEffect(() => {
    const currentWrapperRef = wrapperRef.current;

    document.addEventListener("click", handleClickOutside);
    currentWrapperRef?.addEventListener("focusout", handleFocusOut as unknown as EventListener);

    // Listen for close-nested-dropdowns events if this is a nested dropdown
    const handleCloseNestedDropdowns = () => {
      if (nested && isOpen) {
        handleOpenChange(false);
        setFocusedIndex(-1);
      }
    };

    // Listen for close-other-dropdowns event to close this dropdown when another opens
    const handleCloseOtherDropdowns = (e: Event) => {
      const customEvent = e as CustomEvent;
      const exceptId = customEvent.detail?.exceptId;

      // Close this dropdown if it's not the one being excepted
      if (isOpen && dropdownId.current !== exceptId) {
        handleOpenChange(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("close-nested-dropdowns", handleCloseNestedDropdowns);
    document.addEventListener("close-other-dropdowns", handleCloseOtherDropdowns as EventListener);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      currentWrapperRef?.removeEventListener(
        "focusout",
        handleFocusOut as unknown as EventListener,
      );
      document.removeEventListener("close-nested-dropdowns", handleCloseNestedDropdowns);
      document.removeEventListener(
        "close-other-dropdowns",
        handleCloseOtherDropdowns as EventListener,
      );
    };
  }, [handleClickOutside, handleFocusOut, nested, isOpen, handleOpenChange]);

  // Get options from the dropdown
  const getOptions = useCallback(() => {
    if (!dropdownRef.current) return [];

    return Array.from(dropdownRef.current.querySelectorAll(ITEM_SELECTOR)) as HTMLElement[];
  }, []);

  /**
   * Keep the current option in view — on open, and as the arrow keys move.
   *
   * How far to scroll depends on how tall the scrollport is, and that is
   * still settling: Floating UI's `size` middleware caps the panel's height
   * from its own measurements, and `autoUpdate` can revise that again a
   * frame later. Scrolling once, at any single moment, lands short by
   * however much the panel shrinks afterwards — measured on a 51-row year
   * list, the selected row ended up 90px below the scrollport, invisible.
   *
   * The rows move too: a web font swapping in grew each one by 3px, which
   * over the 24 rows above the selection added up to 72px of drift after
   * the scroll had already run.
   *
   * So the scroll is tied to the geometry it depends on rather than to a
   * guess about when that stops changing: the scrollport for its height,
   * the row for the content's. Either resizing re-runs it. It is
   * idempotent, scrolls nothing once everything fits, and stops as soon as
   * the panel closes.
   */
  useEffect(() => {
    if (!isOpen || !isPositioned) return;

    const bring = () => {
      const options = getOptions();
      if (focusedIndex >= 0 && focusedIndex < options.length) {
        scrollOptionIntoView(options[focusedIndex]);
      }
    };
    bring();

    const option = getOptions()[focusedIndex];
    const scroller = findScroller(option);
    if (!scroller || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(bring);
    observer.observe(scroller);
    if (option) observer.observe(option);
    return () => observer.disconnect();
  }, [isOpen, isPositioned, focusedIndex, getOptions, scrollOptionIntoView, findScroller]);

  // Track hover on options to sync with keyboard navigation
  useEffect(() => {
    if (!isOpen || !dropdownRef.current) return;

    const handleOptionHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const option = target.closest(ITEM_SELECTOR) as HTMLElement;

      if (option && dropdownRef.current?.contains(option)) {
        const options = getOptions();
        const index = options.indexOf(option);
        if (index >= 0 && index !== focusedIndex) {
          setFocusedIndex(index);
        }
      }
    };

    const dropdown = dropdownRef.current;
    dropdown.addEventListener("mouseover", handleOptionHover);

    return () => {
      dropdown.removeEventListener("mouseover", handleOptionHover);
    };
  }, [isOpen, focusedIndex, getOptions]);

  /**
   * Names the open list after the trigger (see `triggerId`). The list's
   * element is ArrowNavigation's, the panel's parent, and ArrowNavigation
   * takes an `aria-label` but no `aria-labelledby`, so it is set here once
   * the list is in the document. A combobox's panel, and one without arrow
   * navigation, has no list of this wrapper's to name.
   */
  const listIsOurs = handleArrowNavigation && !isCombobox;
  useEffect(() => {
    if (!isOpen || !isBrowser || !listIsOurs) return;
    dropdownRef.current?.parentElement?.setAttribute("aria-labelledby", triggerId);
  }, [isOpen, isBrowser, listIsOurs, triggerId]);

  // Determine the appropriate navigation layout
  const determineNavigationLayout = useCallback((): NavigationLayout => {
    // Use the prop if provided, otherwise default to column
    if (propNavigationLayout) {
      return propNavigationLayout;
    }
    // Default to column layout for most dropdowns
    return "column";
  }, [propNavigationLayout]);

  const [navigationLayout, setNavigationLayout] = useState<NavigationLayout>(
    propNavigationLayout || "column",
  );
  const [optionsCount, setOptionsCount] = useState(propOptionsCount || 0);

  const triggerState = useMemo<DropdownTriggerState>(
    () => ({
      expanded: isOpen,
      haspopup: !handleArrowNavigation
        ? "dialog"
        : navigationLayout === "grid"
          ? "grid"
          : isMenu
            ? "menu"
            : "listbox",
      register: registerButtonTrigger,
      setActiveIndex: setFocusedIndex,
    }),
    [isOpen, handleArrowNavigation, navigationLayout, isMenu, registerButtonTrigger],
  );

  // Update options count when dropdown opens or content changes
  useEffect(() => {
    if (isOpen) {
      // If optionsCount is provided as a prop, use it
      if (propOptionsCount !== undefined) {
        setOptionsCount(propOptionsCount);
      } else {
        const options = getOptions();
        setOptionsCount(options.length);
      }

      // Try to determine the layout based on the dropdown content or props
      setNavigationLayout(determineNavigationLayout());
    }
  }, [isOpen, getOptions, determineNavigationLayout, propOptionsCount]);

  // Handle option selection
  const handleOptionSelect = useCallback(
    (index: number) => {
      const options = getOptions();
      if (index >= 0 && index < options.length) {
        options[index].click();

        if (closeAfterClick) {
          handleOpenChange(false);
          setFocusedIndex(-1);
        }
      }
    },
    [getOptions, closeAfterClick, handleOpenChange],
  );

  // Handle focus change. Scrolling the new option into view is the effect
  // above, which is tied to the scrollport's size; recording the index is
  // all this has to do.
  const handleFocusChange = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!isOpen) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleOpenChange(true);
        }
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        handleOpenChange(false);
        setFocusedIndex(-1);
        return;
      }

      // A panel the pointer opened has left focus on the trigger: an arrow
      // key there moves into it, as it would have if a click had opened it.
      if (
        hoverOpenedRef.current &&
        (e.key === "ArrowDown" || e.key === "ArrowUp") &&
        !portalRef.current?.contains(document.activeElement)
      ) {
        e.preventDefault();
        previouslyFocusedElement.current = document.activeElement;
        setHoverOpened(false);
        return;
      }

      // Handle tab key for focus trapping. The panel's FocusTrap sees Tab
      // first and has already moved focus; wrapping again from there sent
      // Tab from the last-but-one control back to the first.
      if (e.key === "Tab" && dropdownRef.current) {
        if (e.defaultPrevented) return;
        // Find all focusable elements in the dropdown
        const focusableElements = Array.from(
          dropdownRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ) as HTMLElement[];

        if (focusableElements.length === 0) return;

        // Get the first and last focusable elements
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Handle tab and shift+tab to cycle through focusable elements
        if (e.shiftKey) {
          // Shift+Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }

        return;
      }

      // If handleArrowNavigation is false, forward keyboard events to the dropdown content
      if (!handleArrowNavigation && dropdownRef.current) {
        // Let the dropdown content handle arrow keys, enter, space, etc.
        return;
      }

      // Arrow key navigation will be handled by ArrowNavigation component
      // Enter/Space key selection will be handled by ArrowNavigation component
    },
    [isOpen, handleOpenChange, handleArrowNavigation, setHoverOpened],
  );

  /** For content that closes the panel itself: see DropdownCloseContext. */
  const closeFromContent = useCallback(() => {
    handleOpenChange(false);
    setFocusedIndex(-1);
  }, [handleOpenChange]);

  const tree = (
    // The combobox flag is this wrapper's alone: a dropdown inside it is not one.
    <DropdownComboboxContext.Provider value={false}>
      <DropdownCloseContext.Provider value={closeFromContent}>
        <ScrollLock enabled={scrollLocked} allowScrollInElement={dropdownRef} />
        <Column
          fillWidth={fillWidth}
          fitWidth={!fillWidth}
          transition="macro-medium"
          style={{
            ...style,
          }}
          className={className}
          ref={wrapperRef}
          onFocusCapture={onFocusCapture}
          onBlurCapture={onBlurCapture}
          onClick={
            disableTriggerClick
              ? undefined
              : (e) => {
                  // The trigger's own onClick below has already toggled: a
                  // click there bubbling on to here reported the open twice.
                  if (triggerRef.current?.contains(e.target as Node)) return;
                  if (!isOpen) {
                    handleOpenChange(true);
                    return;
                  }
                }
          }
          // A combobox handles its own keys, the panel's included.
          onKeyDown={isCombobox ? undefined : handleKeyDown}
          tabIndex={-1}
          data-role="dropdown-wrapper"
        >
          <Row
            ref={triggerRef}
            id={triggerId}
            fillWidth={fillWidth}
            fitWidth={!fillWidth}
            onClick={
              disableTriggerClick
                ? undefined
                : (e) => {
                    clearHoverTimer();
                    // A click on a panel the pointer opened pins it open.
                    if (isOpen && hoverOpenedRef.current) {
                      previouslyFocusedElement.current = document.activeElement;
                      setHoverOpened(false);
                      return;
                    }
                    // If already open, close on trigger click
                    if (isOpen) {
                      handleOpenChange(false);
                      return;
                    }
                    handleOpenChange(true);
                  }
            }
            onPointerEnter={
              hover
                ? (e) => {
                    if (e.pointerType === "touch") return;
                    clearHoverTimer();
                    if (isOpen) return;
                    hoverTimer.current = setTimeout(() => {
                      hoverTimer.current = null;
                      setHoverOpened(true);
                      handleOpenChange(true);
                    }, openDelay);
                  }
                : undefined
            }
            onPointerLeave={
              hover
                ? () => {
                    // Not there long enough to open. Closing an open panel
                    // is the document listener's: the pointer may be on
                    // its way into it.
                    if (!isOpen) clearHoverTimer();
                  }
                : undefined
            }
            onKeyDown={isCombobox ? undefined : handleKeyDown}
            // With a trigger that is not a control of its own (a span, an
            // Avatar), this row is the button: one, not two nested ones, and
            // in the tab order, or no keyboard can open the panel.
            role={wrapperIsTrigger ? "button" : undefined}
            tabIndex={wrapperIsTrigger ? 0 : undefined}
            data-is-dropdown="true"
            aria-haspopup={wrapperIsTrigger ? "true" : undefined}
            aria-expanded={wrapperIsTrigger ? isOpen : undefined}
            className="dropdown-trigger"
          >
            <DropdownTriggerContext.Provider value={triggerState}>
              {trigger}
            </DropdownTriggerContext.Provider>
          </Row>
          {isOpen &&
            dropdown &&
            isBrowser &&
            createPortal(
              <FocusTrap
                containerRef={portalRef}
                // Not `isOpen`: the panel is `visibility: hidden` until Floating
                // UI has measured it, and a hidden element cannot take focus, so
                // autofocusing before then silently lands nowhere.
                active={isOpen && isPositioned}
                onEscape={() => handleOpenChange(false)}
                // A combobox keeps focus in its field; the trap only holds Tab
                // inside the panel once the combobox has put focus there (a
                // searchable Select's query field).
                autoFocus={!isCombobox && !hoverOpened}
                restoreFocus={!isCombobox && !hoverOpened}
              >
                {handleArrowNavigation && !isCombobox ? (
                  <ArrowNavigation
                    layout={navigationLayout}
                    itemCount={optionsCount}
                    columns={typeof columns === "string" ? parseInt(columns, 10) || 8 : columns}
                    onSelect={handleOptionSelect}
                    onFocusChange={handleFocusChange}
                    wrap
                    // A leading field keeps focus; the list is one ArrowDown away.
                    autoFocus={isPositioned && opensOn === "options" && !hoverOpened}
                    initialFocusedIndex={focusedIndex}
                    itemSelector={ITEM_SELECTOR}
                    role={navigationLayout === "grid" ? "grid" : isMenu ? "menu" : "listbox"}
                    // Named after the trigger: see `triggerId`.
                    disabled={getLastOpenedDropdown() !== dropdownId.current}
                  >
                    <Flex
                      zIndex={9}
                      className={`${styles.fadeIn} dropdown-portal`}
                      minWidth={minWidth}
                      ref={dropdownRef}
                      style={{
                        position: strategy,
                        top: y ?? 0,
                        left: x ?? 0,
                        // Floating UI reports 0,0 until it has measured, so the
                        // panel would otherwise paint once at the edge of the
                        // positioning context before jumping to the trigger.
                        // Hidden rather than unmounted: it has to be in the DOM
                        // to be measured at all.
                        visibility: isPositioned ? "visible" : "hidden",
                        transformOrigin,
                      }}
                      data-role="dropdown-portal"
                      data-is-dropdown="true"
                      data-dropdown-id={dropdownId.current}
                      data-is-active={getLastOpenedDropdown() === dropdownId.current}
                      data-menu-tree={dropdownId.current}
                      onPointerMove={onRootPointerMove}
                      onKeyDown={(e) => {
                        // If handleArrowNavigation is false, let all keyboard events pass through
                        if (!handleArrowNavigation) {
                          return;
                        }

                        // Let FocusTrap handle Tab key
                        // Let ArrowNavigation handle arrow keys
                        if (
                          e.key !== "Tab" &&
                          e.key !== "ArrowUp" &&
                          e.key !== "ArrowDown" &&
                          e.key !== "ArrowLeft" &&
                          e.key !== "ArrowRight"
                        ) {
                          handleKeyDown(e);
                        }
                      }}
                      onMouseDown={(e) => {
                        // Allow interactive elements (inputs, buttons, etc.) to work normally
                        const target = e.target as HTMLElement;
                        const isInteractive = target.closest(
                          'input, textarea, select, button, [role="button"], a',
                        );
                        if (!isInteractive) {
                          e.preventDefault();
                        }
                      }}
                      onPointerDown={(e) => {
                        // Allow interactive elements (inputs, buttons, etc.) to work normally
                        const target = e.target as HTMLElement;
                        const isInteractive = target.closest(
                          'input, textarea, select, button, [role="button"], a',
                        );
                        if (!isInteractive) {
                          e.preventDefault();
                        }
                      }}
                      onTouchStart={(e) => {
                        // Allow interactive elements (inputs, buttons, etc.) to work normally
                        const target = e.target as HTMLElement;
                        const isInteractive = target.closest(
                          'input, textarea, select, button, [role="button"], a',
                        );
                        if (!isInteractive) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <DropdownPanel
                        // The size() middleware sets the portal's width; the
                        // visible panel must fill it or it sits detached at the
                        // portal's left edge on "-end" placements.
                        fillWidth
                        minWidth={minWidth}
                        radius="l"
                        padding="0"
                        // ArrowNavigation above is the listbox; Dropdown's own
                        // listbox role here nested a listbox in a listbox.
                        // "none": a plain box, like any other in between.
                        role="none"
                        selectedOption={selectedOption}
                        onSelect={(value) => {
                          onSelect?.(value);
                          if (closeAfterClick) {
                            handleOpenChange(false);
                            setFocusedIndex(-1);
                          }
                        }}
                      >
                        <RootTypeahead containerRef={dropdownRef} />
                        {React.Children.map(dropdown, (child) => {
                          if (React.isValidElement(child)) {
                            // Only add onClick handler to elements that have data-value or are interactive
                            const childElement = child as React.ReactElement<any>;
                            // A `value` prop alone does not make a child an
                            // option: Option is matched by type. Reading any
                            // `value` as one caught a DatePicker (its `value`
                            // is the date), replaced its own click handler
                            // with "pick and close", and so every click in the
                            // time panel that was not a day (the hour and
                            // minute chevrons, AM/PM, back to calendar)
                            // closed the dropdown.
                            const hasDataValue =
                              childElement.props["data-value"] ||
                              childElement.type === Option ||
                              childElement.type === "button" ||
                              childElement.props.role === "option";

                            if (hasDataValue) {
                              // An Option, or anything carrying `data-value`,
                              // puts that value on the element it renders, and
                              // the click reaches Dropdown's own onSelect above,
                              // which reports it and closes. Reporting it here
                              // too called onSelect twice per pick, and
                              // replacing the child's onClick dropped the
                              // caller's handler.
                              const rendersValue =
                                childElement.type === Option ||
                                childElement.props["data-value"] !== undefined;
                              // Cast the child element to any to avoid TypeScript errors with unknown props
                              return React.cloneElement(childElement, {
                                onClick: (val: string) => {
                                  childElement.props.onClick?.(val);
                                  if (rendersValue) return;
                                  onSelect?.(val);
                                  if (closeAfterClick) {
                                    handleOpenChange(false);
                                    setFocusedIndex(-1);
                                  }
                                },
                              });
                            }
                            // Return the child unchanged if it doesn't need an onClick handler
                            return child;
                          }
                          return child;
                        })}
                      </DropdownPanel>
                    </Flex>
                  </ArrowNavigation>
                ) : (
                  <Flex
                    zIndex={9}
                    className={`${styles.fadeIn} dropdown-portal`}
                    minWidth={minWidth}
                    ref={dropdownRef}
                    style={{
                      position: strategy,
                      top: y ?? 0,
                      left: x ?? 0,
                      // See the portal above: hidden until Floating UI has
                      // measured, so it cannot paint at 0,0 first.
                      visibility: isPositioned ? "visible" : "hidden",
                      transformOrigin,
                    }}
                    data-role="dropdown-portal"
                    data-is-dropdown="true"
                    data-dropdown-id={dropdownId.current}
                    data-is-active={getLastOpenedDropdown() === dropdownId.current}
                    data-menu-tree={dropdownId.current}
                    onPointerMove={onRootPointerMove}
                    onKeyDown={(e) => {
                      // If handleArrowNavigation is false, let all keyboard events pass through.
                      // So does a combobox's panel: the combobox handles its keys.
                      if (!handleArrowNavigation || isCombobox) {
                        return;
                      }

                      // Let FocusTrap handle Tab key
                      if (e.key !== "Tab") {
                        handleKeyDown(e);
                      }
                    }}
                    onMouseDown={(e) => {
                      // Allow interactive elements (inputs, buttons, etc.) to work normally
                      const target = e.target as HTMLElement;
                      const isInteractive = target.closest(
                        'input, textarea, select, button, [role="button"], a',
                      );
                      if (!isInteractive) {
                        e.preventDefault();
                      }
                    }}
                    onPointerDown={(e) => {
                      // Allow interactive elements (inputs, buttons, etc.) to work normally
                      const target = e.target as HTMLElement;
                      const isInteractive = target.closest(
                        'input, textarea, select, button, [role="button"], a',
                      );
                      if (!isInteractive) {
                        e.preventDefault();
                      }
                    }}
                    onTouchStart={(e) => {
                      // Allow interactive elements (inputs, buttons, etc.) to work normally
                      const target = e.target as HTMLElement;
                      const isInteractive = target.closest(
                        'input, textarea, select, button, [role="button"], a',
                      );
                      if (!isInteractive) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <DropdownPanel
                      fillWidth
                      minWidth={minWidth}
                      radius="l"
                      padding="0"
                      // Not a listbox, as Dropdown is on its own: this panel
                      // holds whatever the caller put in it (a date grid, an
                      // emoji picker), and a combobox brings its own listbox,
                      // which this one would wrap.
                      role="none"
                      selectedOption={selectedOption}
                      onSelect={(value) => {
                        onSelect?.(value);
                        if (closeAfterClick) {
                          handleOpenChange(false);
                          setFocusedIndex(-1);
                        }
                      }}
                    >
                      {dropdown}
                    </DropdownPanel>
                  </Flex>
                )}
              </FocusTrap>,
              document.body,
            )}
        </Column>
      </DropdownCloseContext.Provider>
    </DropdownComboboxContext.Provider>
  );

  // The menu tree a Submenu inside joins (see menuTree). With one, the items
  // are menu items.
  return (
    <MenuRootContext.Provider value={menuRoot}>
      <MenuLevelContext.Provider value={rootLevel}>
        <OptionRoleContext.Provider value={isMenu ? "menuitem" : outerOptionRole}>
          {tree}
        </OptionRoleContext.Provider>
      </MenuLevelContext.Provider>
    </MenuRootContext.Provider>
  );
};

DropdownMenu.displayName = "DropdownMenu";

/**
 * A `trigger` and the panel it opens: a menu of Options, a picker, a form.
 *
 * `openOn="contextmenu"` makes it a context menu: it opens at the pointer on
 * right-click over the trigger (2.x `ContextMenu`). The content goes in
 * `children` (2.x DropdownWrapper's `dropdown`, still accepted for one minor).
 */
const Dropdown = ({
  ref,
  openOn = "click",
  children,
  disabled,
  contents,
  ...props
}: DropdownProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const content = children;
  if (openOn === "contextmenu") {
    const {
      trigger,
      placement,
      fillWidth,
      minWidth,
      maxWidth,
      minHeight,
      style,
      className,
      onSelect,
      closeAfterClick,
      open,
      onOpenChange,
      selectedOption,
    } = props;
    return (
      <ContextMenuImpl
        ref={ref}
        dropdown={content}
        placement={placement}
        fillWidth={fillWidth}
        minWidth={minWidth}
        maxWidth={maxWidth}
        minHeight={minHeight}
        style={style}
        className={className}
        onSelect={onSelect}
        closeAfterClick={closeAfterClick}
        open={open}
        onOpenChange={onOpenChange}
        selectedOption={selectedOption}
        disabled={disabled}
        contents={contents}
      >
        {trigger}
      </ContextMenuImpl>
    );
  }
  return <DropdownMenu ref={ref} dropdown={content} hover={openOn === "hover"} {...props} />;
};

Dropdown.displayName = "Dropdown";

export { Dropdown };
