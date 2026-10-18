"use client";

import { type Ref, useEffect, useRef, useState } from "react";
import { useLayout } from "../contexts/LayoutProvider.js";
import {
  applyBreakpointStyle,
  type BreakpointOverride,
  breakpointStyle,
} from "../utils/layoutClasses.js";
import { Cursor } from "./Cursor.js";
import { ServerFlex, type ServerFlexProps } from "./ServerFlex.js";

type ClientFlexProps = ServerFlexProps;

const generateBackgroundClass = (
  type: "background" | "solid",
  value: string,
): string | undefined => {
  if (value === "transparent") return `transparent-${type}`;
  if (["surface", "page", "overlay"].includes(value)) return `${value}-${type}`;
  const parts = value.split("-");
  if (parts.includes("alpha")) {
    const [scheme, , weight] = parts;
    return `${scheme}-${type}-alpha-${weight}`;
  }
  const [scheme, weight] = value.split("-");
  return `${scheme}-${type}-${weight}`;
};

// Properties the server component already writes as classes.
const CLASS_BASED_PROPS = new Set([
  "direction",
  "horizontal",
  "vertical",
  "center",
  "wrap",
  "flex",
  "position",
  "hide",
  "overflow",
  "overflowX",
  "overflowY",
  "top",
  "right",
  "bottom",
  "left",
]);

const ClientFlex = ({
  ref,
  cursor,
  hide,
  xl,
  l,
  m,
  s,
  xs,
  ...props
}: ClientFlexProps & { ref?: Ref<HTMLElement> }) => {
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
    // resolved by the helper ClientGrid shares. A token spacing or offset is a
    // class, from ServerFlex.
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
};

ClientFlex.displayName = "ClientFlex";

export { ClientFlex };
