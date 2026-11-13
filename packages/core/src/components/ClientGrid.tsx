"use client";

import { type Ref, useEffect, useRef, useState } from "react";
import { useLayout } from "../contexts/LayoutProvider.js";
import { isCursorNode } from "../utils/cursor.js";
import {
  applyBreakpointStyle,
  type BreakpointOverride,
  breakpointStyle,
} from "../utils/layoutClasses.js";
import { Cursor } from "./Cursor.js";
import { ServerGrid, type ServerGridProps } from "./ServerGrid.js";

type ClientGridProps = ServerGridProps;

const ClientGrid = ({
  ref,
  cursor,
  hide,
  xl,
  l,
  m,
  s,
  xs,
  ...props
}: ClientGridProps & { ref?: Ref<HTMLElement> }) => {
  const elementRef = useRef<HTMLElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const { currentBreakpoint } = useLayout();

  // Combine refs
  const combinedRef = (node: HTMLElement) => {
    elementRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };
  const override = useRef<BreakpointOverride | null>(null);

  // Responsive styles logic (client-side only). It runs after every render:
  // a re-render can rewrite a base value the current breakpoint overrides,
  // and the pass has to land on top of it again.
  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;

    // Cascade breakpoints: larger breakpoint styles flow down to smaller ones
    // Order: xl > l > m > s > xs
    const getCascadedProps = () => {
      const breakpointOrder = ["xl", "l", "m", "s", "xs"];
      const breakpointProps = { xl, l, m, s, xs };
      const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

      if (currentIndex === -1) return null;

      // Merge props from current breakpoint up to the largest defined breakpoint
      let mergedProps: any = {};
      for (let i = 0; i <= currentIndex; i++) {
        const bp = breakpointOrder[i] as keyof typeof breakpointProps;
        if (breakpointProps[bp]) {
          mergedProps = { ...mergedProps, ...breakpointProps[bp] };
        }
      }

      return Object.keys(mergedProps).length > 0 ? mergedProps : null;
    };

    const currentResponsiveProps = getCascadedProps();

    // Undo the previous pass, restoring whatever base inline value it wrote
    // over, then apply the current breakpoint: everything a class cannot hold,
    // through the helper ClientFlex uses, so a breakpoint `width` or numeric
    // spacing applies here as it does there. A token spacing or offset is a
    // class, from ServerGrid.
    override.current = applyBreakpointStyle(
      element,
      currentResponsiveProps ? breakpointStyle(currentResponsiveProps) : [],
      override.current,
    );
  });

  // Detect touch device
  useEffect(() => {
    const checkTouchDevice = () => {
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const hasPointer = window.matchMedia("(pointer: fine)").matches;
      setIsTouchDevice(hasTouch && !hasPointer);
    };

    checkTouchDevice();

    const mediaQuery = window.matchMedia("(pointer: fine)");
    const handlePointerChange = () => checkTouchDevice();

    mediaQuery.addEventListener("change", handlePointerChange);

    return () => {
      mediaQuery.removeEventListener("change", handlePointerChange);
    };
  }, []);

  // A node as `cursor` follows the pointer and hides the native cursor
  // over this element's own surface (`data-cursor-follow` in the
  // stylesheet); a keyword or a preset goes through to ServerGrid.
  const follow = isCursorNode(cursor) && !isTouchDevice;

  // Pass hide prop directly to ServerGrid - it will handle responsive hiding via CSS classes
  // No need for client-side logic that causes re-renders on every resize
  return (
    <>
      <ServerGrid
        {...props}
        cursor={isCursorNode(cursor) ? undefined : cursor}
        xl={xl}
        l={l}
        m={m}
        s={s}
        xs={xs}
        hide={hide}
        ref={combinedRef}
        {...(follow && { "data-cursor-follow": "" })}
      />
      {follow && <Cursor cursor={cursor} elementRef={elementRef} />}
    </>
  );
};

ClientGrid.displayName = "ClientGrid";

export { ClientGrid };
