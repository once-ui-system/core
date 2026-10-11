"use client";

import React, {
  forwardRef,
  KeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { Placement } from "../types";
import styles from "./ContextMenu.module.scss";
import { Dropdown } from "./Dropdown";
import { Flex } from "./Flex";
import { OptionRoleContext } from "./OptionRoleContext";
import { ScrollLock } from "./ScrollLock";

export interface ContextMenuProps {
  children: ReactNode;
  dropdown: ReactNode;
  placement?: Placement;
  fillWidth?: boolean;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  style?: React.CSSProperties;
  className?: string;
  onSelect?: (value: string) => void;
  closeAfterClick?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  selectedOption?: string;
  disabled?: boolean;
  /**
   * Render no box around `children` (CSS `display: contents`), so the menu
   * adds nothing to layout: an absolutely positioned child still positions
   * against its own ancestors, and a grid or flex item stays one. There is
   * then no box for `className`, `style` or the disabled dimming to style.
   */
  contents?: boolean;
}

/** The menu's items, in the order the arrow keys move through them. */
const ITEM_SELECTOR = '[role="menuitem"], [role="option"], .option, [data-value]';

const isEnabled = (item: Element) =>
  !item.hasAttribute("disabled") && item.getAttribute("aria-disabled") !== "true";

const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(
  (
    {
      children,
      dropdown,
      minHeight,
      onSelect,
      closeAfterClick = true,
      open,
      onOpenChange,
      minWidth = 12,
      maxWidth,
      fillWidth = false,
      placement = "bottom-end",
      disabled = false,
      contents = false,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const [contextPosition, setContextPosition] = useState({ x: 0, y: 0 });
    /** Where the menu is drawn: the pointer, moved back inside the viewport if it would overflow. */
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [isBrowser, setIsBrowser] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const previouslyFocusedElement = useRef<Element | null>(null);

    // Control open state internally if not provided
    const isControlled = open !== undefined;
    const isDropdownOpen = isControlled ? open : internalIsOpen;

    // Handle open state changes
    const handleOpenChange = useCallback(
      (open: boolean) => {
        if (!isControlled) {
          setInternalIsOpen(open);
        }
        onOpenChange?.(open);
      },
      [isControlled, onOpenChange],
    );

    // Set browser state for portal rendering
    useEffect(() => {
      setIsBrowser(true);
    }, []);

    /**
     * Open at the pointer. A context menu opened from the keyboard (Shift+F10,
     * the Menu key) has no pointer, and some browsers report it at 0,0, the
     * corner of the viewport: open that one at the element instead.
     */
    const openAt = useCallback(
      (e: ReactMouseEvent) => {
        let x = e.clientX;
        let y = e.clientY;
        if (x === 0 && y === 0 && e.target instanceof Element) {
          const rect = e.target.getBoundingClientRect();
          x = rect.left;
          y = rect.bottom;
        }
        setContextPosition({ x, y });
        // Laid out at the origin first, where the viewport cannot squeeze it,
        // so the effect below measures its real size before placing it.
        setMenuPosition({ x: 0, y: 0 });
        handleOpenChange(true);
      },
      [handleOpenChange],
    );

    const handleContextMenu = useCallback(
      (e: ReactMouseEvent) => {
        if (disabled) return;

        e.preventDefault();
        e.stopPropagation();
        openAt(e);
      },
      [disabled, openAt],
    );

    // Handle click events for MacBook support (Control+click)
    const handleClick = useCallback(
      (e: ReactMouseEvent) => {
        if (disabled) return;

        // Check if it's a control+click (common right-click equivalent on Mac)
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          e.stopPropagation();
          openAt(e);
        }
      },
      [disabled, openAt],
    );

    /**
     * Keep the menu on screen. It opens with its top-left corner at the
     * pointer, so a right-click near the bottom or right edge put most of it
     * out of view; there it opens above or to the left of the pointer
     * instead, the way native context menus do. Measured in layout pixels
     * (`offsetWidth`), which the open animation's scale does not shrink, and
     * before paint, so it never draws in the wrong place first.
     */
    useLayoutEffect(() => {
      if (!isDropdownOpen) return;
      const menu = dropdownRef.current;
      const { x, y } = contextPosition;
      if (!menu) {
        setMenuPosition({ x, y });
        return;
      }
      const width = menu.offsetWidth;
      const height = menu.offsetHeight;
      setMenuPosition({
        x: x + width > window.innerWidth ? Math.max(0, x - width) : x,
        y: y + height > window.innerHeight ? Math.max(0, y - height) : y,
      });
    }, [isDropdownOpen, contextPosition]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          isDropdownOpen &&
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target as Node)
        ) {
          handleOpenChange(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isDropdownOpen, handleOpenChange]);

    /** The items the arrow keys can land on: every item that is not disabled. */
    const enabledItems = useCallback(
      () =>
        dropdownRef.current
          ? (Array.from(dropdownRef.current.querySelectorAll(ITEM_SELECTOR)).filter(
              isEnabled,
            ) as HTMLElement[])
          : [],
      [],
    );

    /** Move focus and the highlight to one item. */
    const focusItem = useCallback((items: HTMLElement[], index: number) => {
      setFocusedIndex(index);
      dropdownRef.current?.querySelectorAll(ITEM_SELECTOR).forEach((item) => {
        item.classList.toggle("highlighted", item === items[index]);
      });
      items[index]?.scrollIntoView?.({ block: "nearest" });
      items[index]?.focus({ preventScroll: true });
    }, []);

    // Focus management
    useEffect(() => {
      if (isDropdownOpen) {
        // Store the currently focused element before focusing the dropdown
        previouslyFocusedElement.current = document.activeElement;

        // Reset focus index when opening
        setFocusedIndex(-1);

        // Store current scroll position
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        // Focus the dropdown after a small delay to ensure it's rendered
        const timer = setTimeout(() => {
          if (dropdownRef.current) {
            // Force focus on the dropdown container first
            dropdownRef.current.focus({ preventScroll: true });

            const items = enabledItems();
            if (items.length > 0) {
              focusItem(items, 0);
            } else {
              // If no items, focus any focusable element
              const focusableElements = dropdownRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
              );

              if (focusableElements.length > 0) {
                (focusableElements[0] as HTMLElement).focus({ preventScroll: true });
              }
            }

            // Restore scroll position that might have been changed by focus
            window.scrollTo(scrollX, scrollY);
          }
        }, 50); // Small delay to ensure DOM is ready
        return () => clearTimeout(timer);
      }

      // Hand focus back to where it was before the menu opened.
      const previous = previouslyFocusedElement.current;
      previouslyFocusedElement.current = null;
      if (previous instanceof HTMLElement && document.contains(previous)) {
        previous.focus({ preventScroll: true });
      }
    }, [isDropdownOpen, enabledItems, focusItem]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        if (!isDropdownOpen) return;

        if (e.key === "Escape") {
          e.preventDefault();
          // Closes this menu only, not a dialog it was opened in.
          e.stopPropagation();
          handleOpenChange(false);
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

        if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
          e.preventDefault();

          const items = enabledItems();
          if (items.length === 0) return;

          // From the item that has focus, so a pointer that focused one is
          // followed; else from the last one the keys reached.
          const active = items.indexOf(document.activeElement as HTMLElement);
          const from = active >= 0 ? active : focusedIndex;
          const last = items.length - 1;
          const next =
            e.key === "Home"
              ? 0
              : e.key === "End"
                ? last
                : e.key === "ArrowDown"
                  ? from < last
                    ? from + 1
                    : 0
                  : from > 0
                    ? from - 1
                    : last;

          focusItem(items, next);
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();

          // Click the focused item
          const items = enabledItems();
          if (focusedIndex >= 0 && focusedIndex < items.length) {
            items[focusedIndex].click();

            if (closeAfterClick) {
              handleOpenChange(false);
            }
          }
        }
      },
      [isDropdownOpen, focusedIndex, handleOpenChange, closeAfterClick, enabledItems, focusItem],
    );

    const menu =
      isDropdownOpen &&
      isBrowser &&
      createPortal(
        <Flex
          position="fixed"
          zIndex={10}
          tabIndex={0}
          ref={(node) => {
            dropdownRef.current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          className={styles.fadeIn}
          style={{
            top: menuPosition.y,
            left: menuPosition.x,
          }}
          role="menu"
          onKeyDown={handleKeyDown}
          onClick={(e) => {
            const el = e.target as HTMLElement;
            const isSelectable = el.closest(ITEM_SELECTOR);

            if (isSelectable && closeAfterClick) {
              setTimeout(() => {
                handleOpenChange(false);
              }, 50);
            }
          }}
        >
          {/* The menu's items are menu items, and the panel around them is a
              group in the menu, not a listbox of its own. */}
          <OptionRoleContext.Provider value="menuitem">
            <Dropdown
              minWidth={minWidth}
              maxWidth={maxWidth}
              minHeight={minHeight}
              radius="l"
              role="group"
              onSelect={(value) => {
                onSelect?.(value);
                if (closeAfterClick) {
                  handleOpenChange(false);
                }
              }}
              {...rest}
            >
              {dropdown}
            </Dropdown>
          </OptionRoleContext.Provider>
        </Flex>,
        document.body,
      );

    return (
      <>
        <ScrollLock enabled={isDropdownOpen} allowScrollInElement={dropdownRef} />
        <Flex
          ref={containerRef}
          onContextMenu={handleContextMenu}
          onClick={handleClick}
          className={className || ""}
          // `display: contents` outranks the Flex's own display class, and
          // without a box its position class contains nothing either.
          style={
            contents
              ? { ...style, display: "contents" }
              : { ...style, opacity: disabled ? 0.6 : undefined }
          }
          aria-disabled={disabled}
        >
          {children}
          {menu}
        </Flex>
      </>
    );
  },
);

ContextMenu.displayName = "ContextMenu";

export { ContextMenu };
