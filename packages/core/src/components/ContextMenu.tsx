"use client";

import React, {
  useState,
  useRef,
  ReactNode,
  forwardRef,
  MouseEvent as ReactMouseEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
} from "react";
import { Placement } from "@floating-ui/react-dom";
import { createPortal } from "react-dom";
import { Flex, Dropdown } from ".";
import styles from "./ContextMenu.module.scss";

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
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  selectedOption?: string;
}

const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(
  (
    {
      children,
      dropdown,
      minHeight,
      onSelect,
      closeAfterClick = true,
      isOpen,
      onOpenChange,
      minWidth = 12,
      maxWidth,
      fillWidth = false,
      placement = "bottom-end",
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const [contextPosition, setContextPosition] = useState({ x: 0, y: 0 });
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [isBrowser, setIsBrowser] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const previouslyFocusedElement = useRef<Element | null>(null);

    // Control open state internally if not provided
    const isControlled = isOpen !== undefined;
    const isDropdownOpen = isControlled ? isOpen : internalIsOpen;

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

    const handleContextMenu = useCallback(
      (e: ReactMouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Set the position to the mouse position
        setContextPosition({ x: e.clientX, y: e.clientY });

        // Open the dropdown
        handleOpenChange(true);
      },
      [handleOpenChange],
    );

    // Handle click events for MacBook support (Control+click)
    const handleClick = useCallback(
      (e: ReactMouseEvent) => {
        // Check if it's a control+click (common right-click equivalent on Mac)
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          e.stopPropagation();

          // Set the position to the mouse position
          setContextPosition({ x: e.clientX, y: e.clientY });

          // Open the dropdown
          handleOpenChange(true);
        }
      },
      [handleOpenChange],
    );

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

    // Scroll locking and focus management
    useEffect(() => {
      if (isDropdownOpen) {
        // Store the currently focused element before focusing the dropdown
        previouslyFocusedElement.current = document.activeElement;

        // Reset focus index when opening
        setFocusedIndex(-1);

        // Lock scroll
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = "hidden";

        // Store current scroll position
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        // Focus the dropdown after a small delay to ensure it's rendered
        setTimeout(() => {
          if (dropdownRef.current) {
            // Force focus on the dropdown container first
            dropdownRef.current.focus();

            // Find all option elements
            const optionElements = Array.from(
              dropdownRef.current.querySelectorAll('.option, [role="option"], [data-value]'),
            ) as HTMLElement[];

            if (optionElements.length > 0) {
              // Set focus index to first option
              setFocusedIndex(0);

              // Focus and highlight the first option
              optionElements[0].focus({ preventScroll: true });
              optionElements[0].classList.add("highlighted");

              // Remove highlight from other options
              for (let i = 1; i < optionElements.length; i++) {
                optionElements[i].classList.remove("highlighted");
              }
            } else {
              // If no options, focus any focusable element
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

        return () => {
          // Unlock scroll when component unmounts or dropdown closes
          document.body.style.overflow = originalStyle;
        };
      } else if (!isDropdownOpen && previouslyFocusedElement.current) {
        // Restore focus when closing
        (previouslyFocusedElement.current as HTMLElement).focus();

        // Ensure scroll is unlocked
        document.body.style.overflow = "";
      }
    }, [isDropdownOpen]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        if (!isDropdownOpen) return;

        if (e.key === "Escape") {
          e.preventDefault();
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

        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();

          // Find all Option components in the dropdown
          const optionElements = dropdownRef.current
            ? Array.from(
                dropdownRef.current.querySelectorAll('.option, [role="option"], [data-value]'),
              )
            : [];

          if (optionElements.length === 0) return;

          let newIndex = focusedIndex;

          if (e.key === "ArrowDown") {
            newIndex = focusedIndex < optionElements.length - 1 ? focusedIndex + 1 : 0;
          } else {
            newIndex = focusedIndex > 0 ? focusedIndex - 1 : optionElements.length - 1;
          }

          setFocusedIndex(newIndex);

          // Highlight the element visually
          optionElements.forEach((el, i) => {
            if (i === newIndex) {
              (el as HTMLElement).classList.add("highlighted");
              // Scroll into view if needed
              (el as HTMLElement).scrollIntoView({ block: "nearest" });
              // Focus the element
              (el as HTMLElement).focus();
            } else {
              (el as HTMLElement).classList.remove("highlighted");
            }
          });
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();

          // Find all Option components
          const optionElements = dropdownRef.current
            ? Array.from(
                dropdownRef.current.querySelectorAll('.option, [role="option"], [data-value]'),
              )
            : [];

          // Click the focused option
          if (focusedIndex >= 0 && focusedIndex < optionElements.length) {
            (optionElements[focusedIndex] as HTMLElement).click();

            if (closeAfterClick) {
              handleOpenChange(false);
            }
          }
        }
      },
      [isDropdownOpen, focusedIndex, handleOpenChange, closeAfterClick],
    );

    return (
      <Flex
        ref={containerRef}
        onContextMenu={handleContextMenu}
        onClick={handleClick}
        className={className || ""}
        style={style}
      >
        {children}
        {isDropdownOpen &&
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
                top: contextPosition.y,
                left: contextPosition.x,
              }}
              role="menu"
              onKeyDown={handleKeyDown}
              onClick={(e) => {
                const el = e.target as HTMLElement;
                const isSelectable =
                  el.closest(".option") ||
                  el.closest("[role='option']") ||
                  el.closest("[data-value]");

                if (isSelectable && closeAfterClick) {
                  setTimeout(() => {
                    handleOpenChange(false);
                  }, 50);
                }
              }}
            >
              <Dropdown
                minWidth={minWidth}
                maxWidth={maxWidth}
                minHeight={minHeight}
                radius="l"
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
            </Flex>,
            document.body,
          )}
      </Flex>
    );
  },
);

ContextMenu.displayName = "ContextMenu";

export { ContextMenu };
