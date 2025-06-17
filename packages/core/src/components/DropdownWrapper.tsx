"use client";

import React, {
  useState,
  useRef,
  useEffect,
  ReactNode,
  forwardRef,
  useImperativeHandle,
  useCallback,
  KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  useFloating,
  shift,
  offset,
  flip,
  size,
  autoUpdate,
  Placement,
} from "@floating-ui/react-dom";
import { Flex, Dropdown, Column, Row } from ".";
import styles from "./DropdownWrapper.module.scss";

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
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

const DropdownWrapper = forwardRef<HTMLDivElement, DropdownWrapperProps>(
  (
    {
      trigger,
      dropdown,
      selectedOption,
      minHeight,
      onSelect,
      closeAfterClick = true,
      isOpen: controlledIsOpen,
      onOpenChange,
      minWidth,
      maxWidth,
      fillWidth = false,
      placement = "bottom-start",
      className,
      style,
    },
    ref,
  ) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [mounted, setMounted] = useState(false);
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const isControlled = controlledIsOpen !== undefined;
    const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

    const handleOpenChange = useCallback(
      (newIsOpen: boolean) => {
        if (!isControlled) {
          setInternalIsOpen(newIsOpen);
        }
        onOpenChange?.(newIsOpen);
      },
      [onOpenChange, isControlled],
    );

    // State to track if we're in a browser environment for portal rendering
    const [isBrowser, setIsBrowser] = useState(false);

    useEffect(() => {
      setIsBrowser(true);
    }, []);

    // Store the reference element's width for fillWidth calculation
    const [referenceWidth, setReferenceWidth] = useState<number | null>(null);

    // We'll measure the width directly in the floating UI middleware

    const { x, y, strategy, refs, update } = useFloating({
      placement: placement,
      open: isOpen,
      middleware: [
        offset(4),
        minHeight ? undefined : flip(),
        shift(),
        size({
          apply({ availableWidth, availableHeight, elements }) {
            // Get the width directly from the trigger element when needed
            let width = "auto";
            
            if (fillWidth && triggerRef.current) {
              const triggerWidth = triggerRef.current.getBoundingClientRect().width;
              width = `${Math.max(triggerWidth, 200)}px`;
            }

            Object.assign(elements.floating.style, {
              width: width,
              minWidth: minWidth ? `${minWidth}rem` : (fillWidth ? width : undefined),
              maxWidth: maxWidth ? `${maxWidth}rem` : `${availableWidth}px`,
              minHeight: `${Math.min(minHeight || 0)}px`,
              maxHeight: `${availableHeight}px`,
            });
          },
        }),
      ],
      whileElementsMounted: autoUpdate,
    });

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

    useEffect(() => {
      if (isOpen && mounted) {
        // Store the currently focused element before focusing the dropdown
        previouslyFocusedElement.current = document.activeElement;

        requestAnimationFrame(() => {
          if (dropdownRef.current) {
            refs.setFloating(dropdownRef.current);
            update();
            // Reset focus index when opening
            setFocusedIndex(-1);

            // Find all focusable elements in the dropdown
            const focusableElements = dropdownRef.current.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            // Focus the first focusable element
            if (focusableElements.length > 0) {
              (focusableElements[0] as HTMLElement).focus();
            }

            // Set up initial keyboard navigation
            const optionElements = dropdownRef.current
              ? Array.from(
                  dropdownRef.current.querySelectorAll('.option, [role="option"], [data-value]'),
                )
              : [];

            // If we have options, highlight the first one
            if (optionElements.length > 0) {
              setFocusedIndex(0);
              optionElements.forEach((el, i) => {
                if (i === 0) {
                  (el as HTMLElement).classList.add("highlighted");
                } else {
                  (el as HTMLElement).classList.remove("highlighted");
                }
              });
            }
          }
        });
      } else if (!isOpen && previouslyFocusedElement.current) {
        // Restore focus when dropdown closes
        (previouslyFocusedElement.current as HTMLElement).focus();
      }
    }, [isOpen, mounted, refs, update]);

    const handleClickOutside = useCallback(
      (event: MouseEvent) => {
        // Check if the click is inside the dropdown or the wrapper
        const isClickInDropdown = dropdownRef.current && dropdownRef.current.contains(event.target as Node);
        const isClickInWrapper = wrapperRef.current && wrapperRef.current.contains(event.target as Node);

        // Only close if the click is outside both the dropdown and the wrapper
        if (!isClickInDropdown && !isClickInWrapper) {
          handleOpenChange(false);
          setFocusedIndex(-1);
        }
      },
      [handleOpenChange, wrapperRef, dropdownRef],
    );

    const handleFocusOut = useCallback(
      (event: FocusEvent) => {
        // Check if focus moved to the dropdown or stayed in the wrapper
        const isFocusInDropdown = dropdownRef.current && dropdownRef.current.contains(event.relatedTarget as Node);
        const isFocusInWrapper = wrapperRef.current && wrapperRef.current.contains(event.relatedTarget as Node);

        // Only close if focus moved outside both the dropdown and the wrapper
        if (!isFocusInDropdown && !isFocusInWrapper) {
          handleOpenChange(false);
          setFocusedIndex(-1);
        }
      },
      [handleOpenChange, wrapperRef, dropdownRef],
    );

    useEffect(() => {
      const currentWrapperRef = wrapperRef.current;

      document.addEventListener("mousedown", handleClickOutside);
      currentWrapperRef?.addEventListener("focusout", handleFocusOut);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        currentWrapperRef?.removeEventListener("focusout", handleFocusOut);
      };
    }, [handleClickOutside, handleFocusOut]);

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
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
          ) as HTMLElement[];

          if (focusableElements.length === 0) return;

          // Get the first and last focusable elements
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          // Handle tab and shift+tab to cycle through focusable elements
          if (e.shiftKey) { // Shift+Tab
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else { // Tab
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
          // We need to look for the actual clickable elements inside the dropdown
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
              setFocusedIndex(-1);
            }
          }
        }
      },
      [isOpen, focusedIndex, handleOpenChange, closeAfterClick],
    );

    return (
      <Column
        fillWidth={fillWidth}
        fitWidth={!fillWidth}
        transition="macro-medium"
        style={{
          ...style,
        }}
        className={className}
        ref={wrapperRef}
        onClick={(e) => {
          if (!isOpen) {
            handleOpenChange(true);
            return;
          }
        }}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Row ref={triggerRef} fillWidth={fillWidth} fitWidth={!fillWidth}>
          {trigger}
        </Row>
        {isOpen && dropdown && isBrowser && createPortal(
          <Flex
            zIndex={1}
            className={styles.fadeIn}
            minWidth={minWidth}
            ref={dropdownRef}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
            }}
            role="listbox"
            onKeyDown={handleKeyDown}
            onClick={(e) => {
              // Prevent clicks inside the dropdown from bubbling up
              e.stopPropagation();
            }}
          >
            <Dropdown
              minWidth={minWidth}
              radius="l"
              selectedOption={selectedOption}
              onSelect={onSelect}
            >
              {dropdown}
            </Dropdown>
          </Flex>,
          document.body
        )}
      </Column>
    );
  },
);

DropdownWrapper.displayName = "DropdownWrapper";
export { DropdownWrapper };
