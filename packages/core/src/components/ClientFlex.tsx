"use client";

import { forwardRef } from "react";
import { ServerFlex, Cursor } from ".";
import { FlexProps, StyleProps, DisplayProps, FlexBreakpointProps } from "../interfaces";
import { SpacingToken, CSSUnit, Colors, RadiusSize, RadiusNest, ShadowSize, Opacity, TextVariant, TextSize, TextWeight, TextType, FlexValue } from "../types";
import { useRef, useEffect, useCallback, CSSProperties, useState } from "react";
import { useLayout } from "..";
import { useResponsiveClasses } from "../hooks/useResponsiveClasses";

interface ClientFlexProps extends FlexProps, StyleProps, DisplayProps {
  cursor?: StyleProps["cursor"];
  xl?: FlexBreakpointProps;
  l?: FlexBreakpointProps;
  m?: FlexBreakpointProps;
  s?: FlexBreakpointProps;
  xs?: FlexBreakpointProps;
  hide?: boolean;
}

const parseDimension = (
  value: number | SpacingToken | CSSUnit | undefined,
  type: "width" | "height",
): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === "number") return `${value}rem`;
  if (typeof value === "string") {
    if (value.endsWith("%") || value.endsWith("vh") || value.endsWith("dvh") || value.endsWith("vw") || value.startsWith("calc(")) {
      return value;
    }
    if (["0", "1", "2", "4", "8", "12", "16", "20", "24", "32", "40", "48", "56", "64", "80", "104", "128", "160"].includes(value)) {
      return `var(--static-space-${value})`;
    }
    if (["xs", "s", "m", "l", "xl"].includes(value)) {
      return `var(--responsive-${type}-${value})`;
    }
  }
  return undefined;
};

const parseSpacing = (value: SpacingToken | number | undefined): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === "number") return `${value}rem`;
  if (typeof value === "string") {
    if (["0", "1", "2", "4", "8", "12", "16", "20", "24", "32", "40", "48", "56", "64", "80", "104", "128", "160"].includes(value)) {
      return `var(--static-space-${value})`;
    }
    if (["xs", "s", "m", "l", "xl"].includes(value)) {
      return `var(--responsive-space-${value})`;
    }
  }
  return undefined;
};

const generateBackgroundClass = (type: "background" | "solid", value: string): string | undefined => {
  if (value === "transparent") return undefined;
  if (["surface", "page", "overlay"].includes(value)) return `${value}-${type}`;
  const parts = value.split("-");
  if (parts.includes("alpha")) {
    const [scheme, , weight] = parts;
    return `${scheme}-${type}-alpha-${weight}`;
  }
  const [scheme, weight] = value.split("-");
  return `${scheme}-${type}-${weight}`;
};

const generateBorderClass = (value: string | boolean): string | undefined => {
  if (value === true) return "default-border";
  if (value === "transparent") return "transparent-border";
  const parts = (value as string).split("-");
  if (parts.includes("alpha")) {
    const [scheme, , weight] = parts;
    return `${scheme}-border-alpha-${weight}`;
  }
  const [scheme, weight] = (value as string).split("-");
  return `${scheme}-border-${weight}`;
};

// Properties handled by CSS classes via useResponsiveClasses
const CLASS_BASED_PROPS = new Set([
  "direction", "horizontal", "vertical", "center", "wrap", "flex",
  "position", "hide", "overflow", "overflowX", "overflowY",
  "top", "right", "bottom", "left",
]);

const ClientFlex = forwardRef<HTMLDivElement, ClientFlexProps>(
  ({ cursor, hide, xl, l, m, s, xs, ...props }, ref) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const { currentBreakpoint, isDefaultBreakpoints } = useLayout();

    if (!isDefaultBreakpoints()) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useResponsiveClasses(elementRef, props.direction, { xl, l, m, s, xs }, currentBreakpoint);
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
        const setStyle = (key: string, value: any) => {
          (element.style as any)[key] = value;
          appliedResponsiveStyles.current.add(key);
        };

        // Handle the style escape hatch
        if (currentResponsiveProps.style) {
          Object.entries(currentResponsiveProps.style).forEach(([key, value]) => {
            setStyle(key, value);
          });
        }

        // Handle inline-style-only props (not handled by CSS classes)
        if (currentResponsiveProps.aspectRatio !== undefined) setStyle("aspectRatio", currentResponsiveProps.aspectRatio);
        if (currentResponsiveProps.width !== undefined) setStyle("width", parseDimension(currentResponsiveProps.width, "width"));
        if (currentResponsiveProps.height !== undefined) setStyle("height", parseDimension(currentResponsiveProps.height, "height"));
        if (currentResponsiveProps.maxWidth !== undefined && !["xs", "s", "m", "l", "xl"].includes(currentResponsiveProps.maxWidth as string)) setStyle("maxWidth", parseDimension(currentResponsiveProps.maxWidth, "width"));
        if (currentResponsiveProps.minWidth !== undefined) setStyle("minWidth", parseDimension(currentResponsiveProps.minWidth, "width"));
        if (currentResponsiveProps.minHeight !== undefined) setStyle("minHeight", parseDimension(currentResponsiveProps.minHeight, "height"));
        if (currentResponsiveProps.maxHeight !== undefined) setStyle("maxHeight", parseDimension(currentResponsiveProps.maxHeight, "height"));

        // Handle numeric spacing (token-based spacing is handled by CSS classes in ServerFlex/useResponsiveClasses)
        if (typeof currentResponsiveProps.padding === "number") setStyle("padding", `${currentResponsiveProps.padding}rem`);
        if (typeof currentResponsiveProps.paddingLeft === "number") setStyle("paddingLeft", `${currentResponsiveProps.paddingLeft}rem`);
        if (typeof currentResponsiveProps.paddingRight === "number") setStyle("paddingRight", `${currentResponsiveProps.paddingRight}rem`);
        if (typeof currentResponsiveProps.paddingTop === "number") setStyle("paddingTop", `${currentResponsiveProps.paddingTop}rem`);
        if (typeof currentResponsiveProps.paddingBottom === "number") setStyle("paddingBottom", `${currentResponsiveProps.paddingBottom}rem`);
        if (typeof currentResponsiveProps.paddingX === "number") { setStyle("paddingLeft", `${currentResponsiveProps.paddingX}rem`); setStyle("paddingRight", `${currentResponsiveProps.paddingX}rem`); }
        if (typeof currentResponsiveProps.paddingY === "number") { setStyle("paddingTop", `${currentResponsiveProps.paddingY}rem`); setStyle("paddingBottom", `${currentResponsiveProps.paddingY}rem`); }
        if (typeof currentResponsiveProps.margin === "number") setStyle("margin", `${currentResponsiveProps.margin}rem`);
        if (typeof currentResponsiveProps.marginLeft === "number") setStyle("marginLeft", `${currentResponsiveProps.marginLeft}rem`);
        if (typeof currentResponsiveProps.marginRight === "number") setStyle("marginRight", `${currentResponsiveProps.marginRight}rem`);
        if (typeof currentResponsiveProps.marginTop === "number") setStyle("marginTop", `${currentResponsiveProps.marginTop}rem`);
        if (typeof currentResponsiveProps.marginBottom === "number") setStyle("marginBottom", `${currentResponsiveProps.marginBottom}rem`);
        if (typeof currentResponsiveProps.marginX === "number") { setStyle("marginLeft", `${currentResponsiveProps.marginX}rem`); setStyle("marginRight", `${currentResponsiveProps.marginX}rem`); }
        if (typeof currentResponsiveProps.marginY === "number") { setStyle("marginTop", `${currentResponsiveProps.marginY}rem`); setStyle("marginBottom", `${currentResponsiveProps.marginY}rem`); }
        if (typeof currentResponsiveProps.gap === "number") setStyle("gap", `${currentResponsiveProps.gap}rem`);
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
