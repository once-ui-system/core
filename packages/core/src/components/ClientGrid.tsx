"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { useLayout } from "../contexts/LayoutProvider";
import { DisplayProps, GridBreakpointProps, GridProps, StyleProps } from "../interfaces";
import { applyBreakpointStyle, BreakpointOverride, breakpointStyle } from "../utils/layoutClasses";
import { Cursor } from "./Cursor";
import { ServerGrid } from "./ServerGrid";

interface ClientGridProps extends GridProps, StyleProps, DisplayProps {
  cursor?: StyleProps["cursor"];
  xl?: GridBreakpointProps;
  l?: GridBreakpointProps;
  m?: GridBreakpointProps;
  s?: GridBreakpointProps;
  xs?: GridBreakpointProps;
  hide?: boolean;
}

const ClientGrid = forwardRef<HTMLDivElement, ClientGridProps>(
  ({ cursor, hide, xl, l, m, s, xs, ...props }, ref) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const { currentBreakpoint } = useLayout();

    // Combine refs
    const combinedRef = (node: HTMLDivElement) => {
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
      // over, then apply the current breakpoint: everything a class cannot
      // hold, through the helper ClientFlex uses, so a breakpoint `width` or
      // numeric spacing applies here as it does there. A token spacing or
      // offset is a class, from ServerGrid.
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

    // Determine if we should hide the default cursor
    const shouldHideCursor = typeof cursor === "object" && cursor && !isTouchDevice;

    // Pass hide prop directly to ServerGrid - it will handle responsive hiding via CSS classes
    // No need for client-side logic that causes re-renders on every resize
    return (
      <>
        <ServerGrid
          {...props}
          xl={xl}
          l={l}
          m={m}
          s={s}
          xs={xs}
          hide={hide}
          ref={combinedRef}
          style={{
            ...props.style,
            cursor: shouldHideCursor ? "none" : props.style?.cursor,
          }}
        />
        {typeof cursor === "object" && cursor && !isTouchDevice && (
          <Cursor cursor={cursor} elementRef={elementRef} />
        )}
      </>
    );
  },
);

ClientGrid.displayName = "ClientGrid";

export { ClientGrid };
