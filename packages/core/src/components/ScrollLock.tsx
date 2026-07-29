"use client";

import { useLayoutEffect, useRef, RefObject } from "react";

interface ScrollLockProps {
  enabled: boolean;
  allowScrollInElement?: RefObject<HTMLElement | null>;
}

// Shared registry so multiple ScrollLock instances know about each other's allowed elements.
// Refs are stored rather than elements: the ref target is usually mounted in a later commit
// than the ScrollLock effect (portals, `isOpen &&` subtrees), so `current` is still null here.
// Dereferencing at event time instead keeps late-attached containers scrollable.
const allowedScrollRefs = new Set<RefObject<HTMLElement | null>>();

const getAllowedScrollElements = (): HTMLElement[] => {
  const elements: HTMLElement[] = [];
  for (const ref of allowedScrollRefs) {
    if (ref.current) {
      elements.push(ref.current);
    }
  }
  return elements;
};

export const ScrollLock = ({ enabled, allowScrollInElement }: ScrollLockProps) => {
  const scrollPositionRef = useRef({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (!enabled) return;

    // Store current scroll position immediately
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    scrollPositionRef.current = { x: scrollX, y: scrollY };

    // Restore scroll position after a microtask to catch any scroll that happens during mount
    queueMicrotask(() => {
      window.scrollTo(scrollX, scrollY);
    });

    // Register this instance's allowed ref in the shared registry
    if (allowScrollInElement) {
      allowedScrollRefs.add(allowScrollInElement);
    }

    // Check if an element can scroll in a given direction
    const canScroll = (el: HTMLElement, deltaY: number): boolean => {
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;
      
      // Element must have scrollable overflow
      if (overflowY !== 'auto' && overflowY !== 'scroll') {
        return false;
      }
      
      const { scrollTop, scrollHeight, clientHeight } = el;
      const hasOverflow = scrollHeight > clientHeight;
      if (!hasOverflow) return false;
      
      // Check if we can scroll in the direction of the wheel
      if (deltaY > 0) {
        // Scrolling down - can we scroll more?
        return scrollTop + clientHeight < scrollHeight;
      } else {
        // Scrolling up - are we not at the top?
        return scrollTop > 0;
      }
    };

    // Find the scrollable parent of a target element within the allowed container
    const findScrollableParent = (target: HTMLElement, container: HTMLElement, deltaY: number): HTMLElement | null => {
      let current: HTMLElement | null = target;
      while (current && container.contains(current)) {
        if (canScroll(current, deltaY)) {
          return current;
        }
        current = current.parentElement;
      }
      // Check the container itself
      if (canScroll(container, deltaY)) {
        return container;
      }
      return null;
    };

    // Prevent wheel scroll — checks ALL registered allowed elements
    const preventWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      for (const allowed of getAllowedScrollElements()) {
        if (allowed.contains(target)) {
          const scrollable = findScrollableParent(target, allowed, e.deltaY);
          if (scrollable) {
            return; // Allow scroll within the scrollable element
          }
        }
      }
      e.preventDefault();
    };

    // Prevent touch scroll
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const preventTouch = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      for (const allowed of getAllowedScrollElements()) {
        if (allowed.contains(target)) {
          const deltaY = touchStartY - e.touches[0].clientY;
          const scrollable = findScrollableParent(target, allowed, deltaY);
          if (scrollable) {
            return;
          }
        }
      }
      e.preventDefault();
    };

    // Prevent keyboard scrolling
    const preventKeyScroll = (e: KeyboardEvent) => {
      const scrollKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
      if (scrollKeys.includes(e.key)) {
        const target = e.target as HTMLElement;
        for (const allowed of getAllowedScrollElements()) {
          if (allowed.contains(target)) {
            return;
          }
        }
        e.preventDefault();
      }
    };

    // Use capture phase to intercept events before they reach targets
    window.addEventListener("wheel", preventWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", preventTouch, { passive: false, capture: true });
    window.addEventListener("keydown", preventKeyScroll, { capture: true });

    return () => {
      window.removeEventListener("wheel", preventWheel, { capture: true });
      window.removeEventListener("touchstart", handleTouchStart, { capture: true });
      window.removeEventListener("touchmove", preventTouch, { capture: true });
      window.removeEventListener("keydown", preventKeyScroll, { capture: true });

      // Unregister from shared registry
      if (allowScrollInElement) {
        allowedScrollRefs.delete(allowScrollInElement);
      }
    };
  }, [enabled, allowScrollInElement]);

  return null;
};

ScrollLock.displayName = "ScrollLock";

/** Reset module-level state for testing */
export const resetScrollLockState = () => {
  allowedScrollRefs.clear();
};
