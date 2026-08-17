"use client";

import type { CSSProperties, ReactNode, RefObject } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../classes/utils";
import { Flex, type FlexComponentProps } from "./Flex";

export interface CursorProps extends Omit<FlexComponentProps, "children" | "cursor"> {
  cursor: ReactNode;
  elementRef?: RefObject<HTMLElement | null>;
  className?: string;
  style?: CSSProperties;
}

const Cursor = forwardRef<HTMLDivElement, CursorProps>(
  ({ cursor, elementRef, className, style, zIndex = 10, ...flex }, ref) => {
    const spanRef = useRef<HTMLSpanElement | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

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

    // Mouse tracking for custom cursor (only on non-touch devices)
    useEffect(() => {
      const element = elementRef?.current ?? spanRef.current?.parentElement ?? null;
      if (!cursor || !element || isTouchDevice) return;

      let animationFrameId: number;

      const handleMouseMove = (e: MouseEvent) => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }

        animationFrameId = requestAnimationFrame(() => {
          setMousePosition({ x: e.clientX, y: e.clientY });
        });
      };

      const handleMouseEnter = () => {
        setIsHovering(true);
      };

      const handleMouseLeave = () => {
        setIsHovering(false);
      };

      element.addEventListener("mouseenter", handleMouseEnter);
      element.addEventListener("mouseleave", handleMouseLeave);
      document.addEventListener("mousemove", handleMouseMove);

      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        element.removeEventListener("mouseenter", handleMouseEnter);
        element.removeEventListener("mouseleave", handleMouseLeave);
        document.removeEventListener("mousemove", handleMouseMove);
      };
    }, [cursor, elementRef, isTouchDevice]);

    // Don't render custom cursor on touch devices or during SSR
    if (isTouchDevice || !isHovering || typeof document === "undefined") {
      return <span ref={spanRef} style={{ display: "none" }} />;
    }

    return (
      <>
        <span ref={spanRef} style={{ display: "none" }} />
        {createPortal(
          <Flex
            ref={ref}
            position="fixed"
            pointerEvents="none"
            zIndex={zIndex}
            className={cn(className)}
            style={{
              left: mousePosition.x,
              top: mousePosition.y,
              transform: "translate(-50%, -50%)",
              transition: "none",
              ...style,
            }}
            {...flex}
          >
            {cursor}
          </Flex>,
          document.body,
        )}
      </>
    );
  },
);

Cursor.displayName = "Cursor";

export { Cursor };
