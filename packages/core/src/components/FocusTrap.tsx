"use client";

import {
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { cn } from "../classes/utils";

export interface FocusTrapProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  active: boolean;
  onEscape?: () => void;
  containerRef?: RefObject<HTMLDivElement | null>;
  className?: string;
  style?: CSSProperties;
  initialFocusRef?: RefObject<HTMLElement | null>;
  returnFocusRef?: RefObject<HTMLElement | null>;
  restoreFocus?: boolean;
  autoFocus?: boolean;
}

const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
};

const FocusTrap = forwardRef<HTMLDivElement, FocusTrapProps>(
  (
    {
      children,
      active,
      onEscape,
      containerRef: externalRef,
      className,
      style,
      initialFocusRef,
      returnFocusRef,
      restoreFocus = true,
      autoFocus = true,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const containerRef = externalRef || internalRef;
    const previouslyFocusedElement = useRef<Element | null>(null);

    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    // Store the previously focused element when the trap becomes active
    useEffect(() => {
      if (active) {
        previouslyFocusedElement.current = document.activeElement;

        if (autoFocus) {
          // Focus the specified initial element or the first focusable element
          if (initialFocusRef?.current) {
            initialFocusRef.current.focus({ preventScroll: true });
          } else if (containerRef.current) {
            const focusableElements = getFocusableElements(containerRef.current);
            if (focusableElements.length > 0) {
              focusableElements[0].focus({ preventScroll: true });
            } else {
              // If no focusable elements, focus the container itself
              containerRef.current.focus({ preventScroll: true });
            }
          }
        }
      } else if (!active && restoreFocus && previouslyFocusedElement.current) {
        // When deactivated, return focus to the specified element or the previously focused element
        const elementToFocus = returnFocusRef?.current || previouslyFocusedElement.current;
        if (elementToFocus && typeof (elementToFocus as HTMLElement).focus === "function") {
          (elementToFocus as HTMLElement).focus({ preventScroll: true });
        }
      }
    }, [active, autoFocus, initialFocusRef, returnFocusRef, restoreFocus, containerRef]);

    // Handle keyboard events for focus trapping
    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (!active) {
        onKeyDown?.(e);
        return;
      }

      // Handle escape key
      if (e.key === "Escape" && onEscape) {
        e.preventDefault();
        onEscape();
        onKeyDown?.(e);
        return;
      }

      // Don't handle arrow keys - let ArrowNavigation handle them
      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        onKeyDown?.(e);
        return;
      }

      // Handle tab key for focus trapping
      if (e.key === "Tab" && containerRef.current) {
        const focusableElements = getFocusableElements(containerRef.current);

        if (focusableElements.length === 0) {
          onKeyDown?.(e);
          return;
        }

        // Get the first and last focusable elements
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Handle tab and shift+tab to cycle through focusable elements
        if (e.shiftKey) {
          // Shift+Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus({ preventScroll: true });
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus({ preventScroll: true });
          }
        }
      }

      onKeyDown?.(e);
    };

    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: focus trap container intercepts tab/escape events for focus management
      <div
        ref={containerRef}
        className={cn(className)}
        style={style}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        {...props}
      >
        {children}
      </div>
    );
  },
);

FocusTrap.displayName = "FocusTrap";

export { FocusTrap };
