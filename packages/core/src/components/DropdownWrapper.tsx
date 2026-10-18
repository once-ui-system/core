"use client";

import { autoUpdate, flip, offset, shift, size, useFloating } from "@floating-ui/react-dom";
import React, {
  FocusEvent,
  forwardRef,
  KeyboardEvent,
  ReactNode,
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
import { NavigationLayout } from "../hooks/useArrowNavigation";
import type { Placement } from "../types";
import {
  clearLastOpenedDropdown,
  getLastOpenedDropdown,
  setLastOpenedDropdown,
} from "../utils/dropdownState";
import { ArrowNavigation } from "./ArrowNavigationContext";
import { Button } from "./Button";
import { Column } from "./Column";
import { Dropdown } from "./Dropdown";
import {
  DropdownComboboxContext,
  DropdownTriggerContext,
  type DropdownTriggerState,
} from "./DropdownTriggerContext";
import styles from "./DropdownWrapper.module.scss";
import { Flex } from "./Flex";
import { FocusTrap } from "./FocusTrap";
import { IconButton } from "./IconButton";
import { Option } from "./Option";
import { Row } from "./Row";
import { ScrollLock } from "./ScrollLock";

export interface DropdownWrapperProps {
  fillWidth?: boolean;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  placement?: Placement;
  trigger: ReactNode;
  dropdown: ReactNode;
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

const isEnabledOption = (el: Element) =>
  !el.hasAttribute("disabled") && el.getAttribute("aria-disabled") !== "true";

const DropdownWrapper = forwardRef<HTMLDivElement, DropdownWrapperProps>(
  (
    {
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
    },
    ref,
  ) => {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);

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
              floatingStyle.minWidth = minWidth ? `${minWidth}rem` : w;
            } else {
              // Let content determine width; only apply an explicit minWidth
              floatingStyle.width = "";
              floatingStyle.minWidth = minWidth ? `${minWidth}rem` : "";
            }

            floatingStyle.maxWidth = maxWidth ? `${maxWidth}rem` : `${availableWidth}px`;
            floatingStyle.minHeight = `${Math.min(minHeight || 0)}px`;
            floatingStyle.maxHeight = `${availableHeight}px`;
          },
        }),
      ],
      whileElementsMounted: autoUpdate,
    });

    /**
     * Where the open animation grows from. The panel scales 0.9 -> 1, so the
     * corner this names stays put while the opposite one travels by 10% of the
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
     * through `getBoundingClientRect`. The panel scales from 0.9 to 1 as it
     * opens, so rects taken during that animation are up to a tenth short
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
        // Store the currently focused element before focusing the dropdown
        previouslyFocusedElement.current = document.activeElement;

        requestAnimationFrame(() => {
          if (dropdownRef.current) {
            refs.setFloating(dropdownRef.current);
            update();

            // A combobox keeps focus in its field and reports its own active
            // option (setActiveIndex), which resetting here would overwrite.
            if (isComboboxRef.current) return;

            // Reset focus index when opening
            setFocusedIndex(-1);

            const focusableElements = Array.from(
              dropdownRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
              ),
            ) as HTMLElement[];

            const optionElements = Array.from(
              dropdownRef.current.querySelectorAll('.option, [role="option"], [data-value]'),
            ) as HTMLElement[];

            const openIndex = resolveOpenIndex(optionElements);

            // A panel that leads with something other than its list — a
            // searchable Select's query field — still opens on that. Only a
            // plain list opens on its selection.
            const leadsWithOptions =
              focusableElements.length > 0 && optionElements.includes(focusableElements[0]);
            const target = leadsWithOptions ? optionElements[openIndex] : focusableElements[0];

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

        if (previouslyFocusedElement.current) {
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
      document.addEventListener(
        "close-other-dropdowns",
        handleCloseOtherDropdowns as EventListener,
      );

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

      return Array.from(
        dropdownRef.current.querySelectorAll('.option, [role="option"], [data-value]'),
      ) as HTMLElement[];
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
        const option = target.closest('[role="option"], [data-value]') as HTMLElement;

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
            : "listbox",
        register: registerButtonTrigger,
        setActiveIndex: setFocusedIndex,
      }),
      [isOpen, handleArrowNavigation, navigationLayout, registerButtonTrigger],
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

        // Handle tab key for focus trapping
        if (e.key === "Tab" && dropdownRef.current) {
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
      [isOpen, handleOpenChange, handleArrowNavigation],
    );

    return (
      // The combobox flag is this wrapper's alone: a dropdown inside it is not one.
      <DropdownComboboxContext.Provider value={false}>
        <ScrollLock enabled={isOpen} allowScrollInElement={dropdownRef} />
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
          role={wrapperIsTrigger ? "button" : undefined}
          aria-haspopup={wrapperIsTrigger ? "listbox" : undefined}
          aria-expanded={wrapperIsTrigger ? isOpen : undefined}
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
                    // If already open, close on trigger click
                    if (isOpen) {
                      handleOpenChange(false);
                      return;
                    }
                    handleOpenChange(true);
                  }
            }
            onKeyDown={isCombobox ? undefined : handleKeyDown}
            role={wrapperIsTrigger ? "button" : undefined}
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
                autoFocus={!isCombobox}
                restoreFocus={!isCombobox}
              >
                {handleArrowNavigation && !isCombobox ? (
                  <ArrowNavigation
                    layout={navigationLayout}
                    itemCount={optionsCount}
                    columns={typeof columns === "string" ? parseInt(columns, 10) || 8 : columns}
                    onSelect={handleOptionSelect}
                    onFocusChange={handleFocusChange}
                    wrap
                    autoFocus={isPositioned}
                    initialFocusedIndex={focusedIndex}
                    itemSelector='.option, [role="option"], [data-value]'
                    role={navigationLayout === "grid" ? "grid" : "listbox"}
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
                      <Dropdown
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
                        {React.Children.map(dropdown, (child) => {
                          if (React.isValidElement(child)) {
                            // Only add onClick handler to elements that have data-value or are interactive
                            const childElement = child as React.ReactElement<any>;
                            const hasDataValue =
                              childElement.props["data-value"] ||
                              childElement.props.value ||
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
                      </Dropdown>
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
                    <Dropdown
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
                    </Dropdown>
                  </Flex>
                )}
              </FocusTrap>,
              document.body,
            )}
        </Column>
      </DropdownComboboxContext.Provider>
    );
  },
);

DropdownWrapper.displayName = "DropdownWrapper";

export { DropdownWrapper };
