"use client";

import { forwardRef } from "react";
import { ServerGrid, Cursor } from ".";
import { GridProps, StyleProps, DisplayProps } from "../interfaces";
import { useRef, useEffect, useCallback, CSSProperties, useState } from "react";
import { useLayout } from "..";
import { useResponsiveClasses } from "../hooks/useResponsiveClasses";

interface ClientGridProps extends GridProps, StyleProps, DisplayProps {
  cursor?: StyleProps["cursor"];
  xl?: any;
  l?: any;
  m?: any;
  s?: any;
  xs?: any;
  hide?: boolean;
}

const ClientGrid = forwardRef<HTMLDivElement, ClientGridProps>(
  ({ cursor, hide, xl, l, m, s, xs, ...props }, ref) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const { currentBreakpoint, isDefaultBreakpoints } = useLayout();

    if (!isDefaultBreakpoints()) {
      useResponsiveClasses(elementRef, { xl, l, m, s, xs }, currentBreakpoint);
    }

    // Combine refs
    const combinedRef = (node: HTMLDivElement) => {
      elementRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };
    const appliedResponsiveStyles = useRef<Set<string>>(new Set());
    const baseStyleRef = useRef<CSSProperties>({});

    // Responsive styles logic (client-side only)
    const applyResponsiveStyles = useCallback(() => {
      if (!elementRef.current) return;

      const element = elementRef.current;

      // Update base styles when style prop changes
      if (props.style) {
        baseStyleRef.current = { ...props.style };
      }

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
            // Deep merge style objects
            if (breakpointProps[bp].style) {
              mergedProps.style = { ...mergedProps.style, ...breakpointProps[bp].style };
            }
          }
        }
        
        return Object.keys(mergedProps).length > 0 ? mergedProps : null;
      };

      const currentResponsiveProps = getCascadedProps();

      // Clear only responsive styles, not base styles
      appliedResponsiveStyles.current.forEach((key) => {
        (element.style as any)[key] = "";
      });
      appliedResponsiveStyles.current.clear();

      // Reapply base styles
      if (baseStyleRef.current) {
        Object.entries(baseStyleRef.current).forEach(([key, value]) => {
          (element.style as any)[key] = value;
        });
      }

      // Apply new responsive styles if we have them for current breakpoint
      if (currentResponsiveProps) {
        if (currentResponsiveProps.style) {
          Object.entries(currentResponsiveProps.style).forEach(([key, value]) => {
            (element.style as any)[key] = value;
            appliedResponsiveStyles.current.add(key);
          });
        }
        if (currentResponsiveProps.aspectRatio) {
          element.style.aspectRatio = currentResponsiveProps.aspectRatio;
          appliedResponsiveStyles.current.add("aspect-ratio");
        }
      }
    }, [xl, l, m, s, xs, props.style, currentBreakpoint]);

    useEffect(() => {
      applyResponsiveStyles();
    }, [applyResponsiveStyles]);

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
          isDefaultBreakpoints={isDefaultBreakpoints()}
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
