import { useState, useCallback, KeyboardEvent, RefObject, useEffect } from "react";

export type NavigationLayout = "row" | "column" | "grid";

export interface ArrowNavigationOptions {
  layout: NavigationLayout;
  itemCount: number;
  columns?: number;
  containerRef?: RefObject<HTMLElement | HTMLDivElement | null>;
  onSelect?: (index: number) => void;
  onFocusChange?: (index: number) => void;
  wrap?: boolean;
  initialFocusedIndex?: number;
  itemSelector?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  disableHighlighting?: boolean;
}

export const useArrowNavigation = ({
  layout,
  itemCount,
  columns = 8,
  containerRef,
  onSelect,
  onFocusChange,
  wrap = true,
  initialFocusedIndex = -1,
  itemSelector = '[role="option"], [data-value], button, [tabindex]:not([tabindex="-1"])',
  autoFocus = false,
  disabled = false,
  disableHighlighting = false,
}: ArrowNavigationOptions) => {
  const [focusedIndex, setFocusedIndex] = useState<number>(initialFocusedIndex);

  // Reset focused index when item count changes
  useEffect(() => {
    if (focusedIndex >= itemCount) {
      setFocusedIndex(itemCount > 0 ? 0 : -1);
    }
  }, [itemCount, focusedIndex]);

  // Auto-focus first item if enabled
  useEffect(() => {
    if (autoFocus && itemCount > 0 && focusedIndex === -1) {
      setFocusedIndex(0);
    }
  }, [autoFocus, itemCount, focusedIndex]);

  // Update focus when focusedIndex changes
  useEffect(() => {
    if (focusedIndex >= 0 && containerRef?.current) {
      const items = Array.from(
        containerRef.current.querySelectorAll(itemSelector),
      ) as HTMLElement[];

      if (items.length > focusedIndex) {
        // Check if the item is disabled
        const isDisabled =
          items[focusedIndex].hasAttribute("disabled") ||
          items[focusedIndex].getAttribute("aria-disabled") === "true";

        if (!isDisabled) {
          // Focus the element without scrolling
          items[focusedIndex].focus({ preventScroll: true });

          // Don't call scrollIntoView to avoid unwanted scrolling
          // items[focusedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });

          // Call the focus change callback
          onFocusChange?.(focusedIndex);
        }
      }
    }
  }, [focusedIndex, containerRef, itemSelector, onFocusChange]);

  // Helper function to find the next non-disabled item
  const findNextEnabledItem = useCallback(
    (currentIndex: number, direction: 1 | -1): number => {
      if (!containerRef?.current) return currentIndex;

      const items = Array.from(
        containerRef.current.querySelectorAll(itemSelector),
      ) as HTMLElement[];

      let index = currentIndex;
      let loopCount = 0;

      // Prevent infinite loops by limiting to itemCount iterations
      while (loopCount < itemCount) {
        index += direction;

        // Handle wrapping
        if (index >= itemCount) {
          if (wrap) {
            index = 0;
          } else {
            return currentIndex; // Can't move further
          }
        } else if (index < 0) {
          if (wrap) {
            index = itemCount - 1;
          } else {
            return currentIndex; // Can't move further
          }
        }

        // Check if we've looped back to the start
        if (index === currentIndex) {
          return currentIndex;
        }

        // Check if item is enabled
        if (index < items.length) {
          const isDisabled =
            items[index].hasAttribute("disabled") ||
            items[index].getAttribute("aria-disabled") === "true";
          if (!isDisabled) {
            return index;
          }
        }

        loopCount++;
      }

      // If all items are disabled, return the original index
      return currentIndex;
    },
    [containerRef, itemSelector, itemCount, wrap],
  );

  // Helper function to find the next enabled item from a specific index
  const findEnabledItemFromIndex = useCallback(
    (startIndex: number): number => {
      if (!containerRef?.current) return startIndex;

      const items = Array.from(
        containerRef.current.querySelectorAll(itemSelector),
      ) as HTMLElement[];

      // First check the start index itself
      if (startIndex < items.length) {
        const isDisabled =
          items[startIndex].hasAttribute("disabled") ||
          items[startIndex].getAttribute("aria-disabled") === "true";
        if (!isDisabled) {
          return startIndex;
        }
      }

      // If start index is disabled, find the next enabled item
      return findNextEnabledItem(startIndex, 1);
    },
    [containerRef, itemSelector, findNextEnabledItem],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (disabled || itemCount === 0) return;

      let newIndex = focusedIndex;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          if (layout === "row" || layout === "grid") {
            newIndex = findNextEnabledItem(focusedIndex, 1);
          }
          break;

        case "ArrowLeft":
          e.preventDefault();
          if (layout === "row" || layout === "grid") {
            newIndex = findNextEnabledItem(focusedIndex, -1);
          }
          break;

        case "ArrowDown":
          e.preventDefault();
          if (layout === "column") {
            newIndex = findNextEnabledItem(focusedIndex, 1);
          } else if (layout === "grid") {
            // Move down by the number of columns
            const nextIndex = focusedIndex + columns;
            if (nextIndex < itemCount) {
              newIndex = findEnabledItemFromIndex(nextIndex);
            } else if (wrap) {
              // Wrap to the beginning of the same column
              const column = focusedIndex % columns;
              newIndex = findEnabledItemFromIndex(column);
            }
          }
          break;

        case "ArrowUp":
          e.preventDefault();
          if (layout === "column") {
            newIndex = findNextEnabledItem(focusedIndex, -1);
          } else if (layout === "grid") {
            // Move up by the number of columns
            const nextIndex = focusedIndex - columns;
            if (nextIndex >= 0) {
              newIndex = findEnabledItemFromIndex(nextIndex);
            } else if (wrap) {
              // Wrap to the end of the same column
              const column = focusedIndex % columns;
              const lastRow = Math.floor((itemCount - 1) / columns);
              const targetIndex = lastRow * columns + column;
              newIndex = findEnabledItemFromIndex(Math.min(targetIndex, itemCount - 1));
            }
          }
          break;

        case "Home":
          e.preventDefault();
          newIndex = 0;
          break;

        case "End":
          e.preventDefault();
          newIndex = itemCount - 1;
          break;
          
        case 'Enter':
        case ' ':
          if (focusedIndex >= 0 && focusedIndex < itemCount) {
            e.preventDefault();
            onSelect?.(focusedIndex);
          }
          break;

        default:
          return;
      }

      if (newIndex !== focusedIndex) {
        setFocusedIndex(newIndex);
      }
    },
    [layout, itemCount, focusedIndex, columns, wrap, onSelect, disabled],
  );

  /**
   * Apply highlighted state to elements
   */
  const applyHighlightedState = useCallback(() => {
    if (!containerRef?.current || disableHighlighting) return;

    const items = Array.from(containerRef.current.querySelectorAll(itemSelector)) as HTMLElement[];

    items.forEach((item, index) => {
      // Check if the item is disabled
      const isDisabled =
        item.hasAttribute("disabled") || item.getAttribute("aria-disabled") === "true";

      if (index === focusedIndex && !isDisabled) {
        item.setAttribute("data-highlighted", "true");
        item.classList.add("highlighted");
        item.setAttribute("aria-selected", "true");
      } else {
        item.removeAttribute("data-highlighted");
        item.classList.remove("highlighted");
        item.setAttribute("aria-selected", "false");
      }
    });
  }, [containerRef, itemSelector, focusedIndex, disableHighlighting]);

  // Apply highlighted state when focusedIndex changes
  useEffect(() => {
    applyHighlightedState();
  }, [focusedIndex, applyHighlightedState]);

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
    applyHighlightedState,
  };
};
