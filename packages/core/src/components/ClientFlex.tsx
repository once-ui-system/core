"use client";

import { forwardRef } from "react";
import { ServerFlex, Cursor } from ".";
import { FlexProps, StyleProps, DisplayProps } from "../interfaces";
import { useRef, useEffect, useCallback, CSSProperties, useState } from "react";
import { useLayout } from "..";
import { useResponsiveClasses } from "../hooks/useResponsiveClasses";

interface ClientFlexProps extends FlexProps, StyleProps, DisplayProps {
  cursor?: StyleProps["cursor"];
  xl?: any;
  l?: any;
  m?: any;
  s?: any;
  xs?: any;
  hide?: boolean;
}

const ClientFlex = forwardRef<HTMLDivElement, ClientFlexProps>(
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

      // Determine which responsive props to apply based on current breakpoint
      let currentResponsiveProps: any = null;
      if (currentBreakpoint === "xl" && xl) {
        currentResponsiveProps = xl;
      } else if (currentBreakpoint === "l" && l) {
        currentResponsiveProps = l;
      } else if (currentBreakpoint === "m" && m) {
        currentResponsiveProps = m;
      } else if (currentBreakpoint === "s" && s) {
        currentResponsiveProps = s;
      } else if (currentBreakpoint === "xs" && xs) {
        currentResponsiveProps = xs;
      }

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

    // Pass hide prop directly to ServerFlex - it will handle responsive hiding via CSS classes
    // No need for client-side logic that causes re-renders on every resize
    return (
      <>
        <ServerFlex
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

ClientFlex.displayName = "ClientFlex";
export { ClientFlex };
